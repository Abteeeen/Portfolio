import { cases, type CaseStudy, type Discipline } from "@/content/site";

export type Mode = "brief" | "role";

export type BriefAnswer = {
  approach: string;
  cases: { slug: string; title: string; discipline: Discipline }[];
  source: "local" | "n8n";
};

const approaches: Record<Discipline, string> = {
  Marketing:
    "First, measurement. I would make sure every enquiry has a source before touching spend. Then the page the ads land on, then the ads themselves. You would get a weekly page with cost per lead and where each lead came from.",
  Automation:
    "I would map the manual steps first, then build the smallest n8n workflow that removes the daily one. It posts where you already look, usually Slack or WhatsApp, and it comes with a handover document so it keeps running without me.",
  People:
    "Start with the data you already have: applications, tenure, reviews. I would consolidate it, put a scored shortlist in front of you for hiring, and a weekly people report in front of leadership.",
  Studio:
    "Concept first, then a reference image you approve, then the generated clips. You see a finished fifteen-second reel before we scale to variants, and the process is written down so the studio can repeat it.",
};

const roleLines: Record<Discipline, string> = {
  Marketing: "growth marketing that is measured before it is scaled",
  Automation: "automation that removes the recurring work",
  People: "people analytics and hiring pipelines that run on data",
  Studio: "AI-assisted creative production with a repeatable system",
};

function title(c: CaseStudy): string {
  return c.client.public ? c.client.name : c.client.anonymised;
}

function score(text: string, c: CaseStudy): number {
  let s = 0;
  for (const k of c.keywords) if (text.includes(k)) s += k.length > 5 ? 2 : 1;
  return s;
}

export function matchBrief(rawText: string, mode: Mode): BriefAnswer {
  const text = rawText.toLowerCase();
  const ranked = cases
    .map((c) => ({ c, s: score(text, c) }))
    .sort((a, b) => b.s - a.s || a.c.number.localeCompare(b.c.number));

  const hits = ranked.filter((r) => r.s > 0).slice(0, 2).map((r) => r.c);
  const fallback = mode === "role" ? ["codevantage-people", "five-star-training-academy"] : ["five-star-training-academy", "tender-radar"];
  const chosen = hits.length ? hits : (fallback.map((slug) => cases.find((c) => c.slug === slug)!) as CaseStudy[]);

  const disciplines = Array.from(new Set(chosen.map((c) => c.discipline)));
  const lead = chosen[0].discipline;

  let approach: string;
  if (mode === "role") {
    const fit = disciplines.map((d) => roleLines[d]).join(", and ");
    approach = `Where I fit: ${fit}. I am an HR analyst who automates, a marketer who measures, and a founder who ships. The casework below is the proof, and the resume link is beside it.`;
  } else {
    approach = approaches[lead];
    if (disciplines.length > 1) {
      approach += ` This also touches ${disciplines
        .slice(1)
        .map((d) => d.toLowerCase())
        .join(" and ")}, which is why the second case is there.`;
    }
  }

  return {
    approach,
    cases: chosen.map((c) => ({ slug: c.slug, title: title(c), discipline: c.discipline })),
    source: "local",
  };
}
