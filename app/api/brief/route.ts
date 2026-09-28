import { NextResponse } from "next/server";
import { cases } from "@/content/site";
import { matchBrief, type BriefAnswer, type Mode } from "@/lib/match";

export const runtime = "nodejs";

/** Best-effort rate limit: 20 requests per minute per address. Resets when the instance recycles. */
const buckets = new Map<string, { n: number; t: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.t > 60_000) {
    buckets.set(ip, { n: 1, t: now });
    return false;
  }
  b.n += 1;
  return b.n > 20;
}

function caseFromSlug(slug: string) {
  const c = cases.find((x) => x.slug === slug);
  if (!c) return null;
  return { slug: c.slug, title: c.client.public ? c.client.name : c.client.anonymised, discipline: c.discipline };
}

/** Accepts the n8n reply in either shape: cases as slugs, or as {slug,title,discipline}. */
function normalise(data: unknown): BriefAnswer | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { approach?: unknown; cases?: unknown };
  if (typeof d.approach !== "string" || !Array.isArray(d.cases)) return null;
  const out: BriefAnswer["cases"] = [];
  for (const item of d.cases) {
    if (typeof item === "string") {
      const c = caseFromSlug(item);
      if (c) out.push(c);
    } else if (item && typeof item === "object") {
      const o = item as { slug?: unknown; title?: unknown; discipline?: unknown };
      if (typeof o.slug === "string") {
        const c = caseFromSlug(o.slug);
        if (c) out.push(c);
      }
    }
  }
  return { approach: d.approach.slice(0, 1200), cases: out.slice(0, 3), source: "n8n" };
}

export async function POST(req: Request) {
  let body: { text?: unknown; mode?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send JSON with a text field." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const mode: Mode = body.mode === "role" ? "role" : "brief";

  if (text.length < 8) {
    return NextResponse.json({ error: "Tell me a little more. One sentence is enough." }, { status: 400 });
  }
  if (text.length > 1500) {
    return NextResponse.json({ error: "That is longer than I need. Keep it under 1,500 characters." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many briefs in a minute. Email me instead." }, { status: 429 });
  }

  const url = process.env.N8N_BRIEF_WEBHOOK_URL;
  if (url) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 9000);
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (process.env.N8N_BRIEF_TOKEN) headers["x-brief-token"] = process.env.N8N_BRIEF_TOKEN;
      const r = await fetch(url, { method: "POST", headers, body: JSON.stringify({ text, mode }), signal: ctrl.signal });
      clearTimeout(timer);
      if (r.ok) {
        const answer = normalise(await r.json());
        if (answer) return NextResponse.json(answer);
      }
    } catch {
      // fall through to the local matcher
    }
  }

  return NextResponse.json(matchBrief(text, mode));
}
