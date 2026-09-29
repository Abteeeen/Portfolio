"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { cases } from "@/content/site";
import { filmCases, filmOrder } from "@/content/film";

/**
 * Casework as the hero's pinboard, one case at a time. On wide screens the section is pinned
 * and scrolling slides a cork board sideways under a fixed picture light. Each case is a problem
 * card, a photo of the proof, what was built, and the results tied to the proof with yellow yarn.
 * On phones the cases stack as separate boards.
 */

/** Board units: one case panel is PW wide and the board is BH tall. */
const PW = 1180;
const BH = 720;
const LEAD = 420;
const TAIL = 470;

type Box = { x: number; y: number; w: number; r: number; h?: number };

function panel(phone: boolean) {
  return {
    head: { x: 0, y: 34, w: 300, r: -1.5 } as Box,
    problem: { x: 14, y: 172, w: 340, r: 1.2 } as Box,
    built: { x: 24, y: 452, w: 332, r: -0.8 } as Box,
    photo: (phone ? { x: 428, y: 26, w: 250, h: 520, r: -2 } : { x: 404, y: 64, w: 450, h: 290, r: -1.4 }) as Box,
    stack: (phone ? { x: 420, y: 632, w: 300, r: 0 } : { x: 404, y: 452, w: 450, r: 0 }) as Box,
    results: [0, 1, 2].map((k) => ({ x: phone ? 752 : 900, y: 44 + k * 178, w: 250, r: k % 2 ? 1.6 : -1.3 })) as Box[],
  };
}

/** Where a pin sits on the board: (px, py) inside a card of height h, turned with the card. */
function pinAt(b: Box, h: number, px: number, py: number): [number, number] {
  const a = (b.r * Math.PI) / 180;
  const dx = px - b.w / 2;
  const dy = py - h / 2;
  return [b.x + b.w / 2 + dx * Math.cos(a) - dy * Math.sin(a), b.y + h / 2 + dx * Math.sin(a) + dy * Math.cos(a)];
}
/** Yarn pulled nearly taut between two pins. */
function yarn([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const sag = 6 + Math.hypot(x2 - x1, y2 - y1) * 0.03;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q ${((x1 + x2) / 2).toFixed(1)} ${((y1 + y2) / 2 + sag).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/** `[[phrase]]` in a brief becomes a highlighter mark. */
function Marked({ text }: { text: string }) {
  const parts = text.split(/\[\[(.+?)\]\]/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

const pos = (b: Box): CSSProperties =>
  ({ "--x": b.x, "--y": b.y, "--w": b.w, "--r": `${b.r}deg`, ...(b.h ? { "--h": b.h } : {}) }) as CSSProperties;

const CASES = filmOrder
  .map((slug, i) => {
    const c = cases.find((x) => x.slug === slug);
    const f = filmCases[slug];
    if (!c || !f) return null;
    const phone = f.device === "phone";
    const L = panel(phone);
    const x0 = LEAD + i * PW;
    const problem = c.brief.split(/(?<=\.)\s/)[0];
    const ph = (L.photo.h ?? 0) + 58;
    const threads = [
      yarn(pinAt(L.problem, 190, L.problem.w - 23, 19), pinAt(L.photo, ph, 23, 17)),
      ...L.results.map((r) => yarn(pinAt(L.photo, ph, L.photo.w - 23, 17), pinAt(r, 150, 23, 19))),
    ];
    return {
      slug,
      i,
      num: String(i + 1).padStart(2, "0"),
      name: c.client.public ? c.client.name : c.client.anonymised,
      short: f.short,
      discipline: c.discipline,
      place: c.place,
      problem,
      built: c.built.slice(0, 3),
      results: c.result.slice(0, 3),
      stack: c.stack.slice(0, 5),
      image: f.image,
      caption: f.caption,
      phone,
      L,
      x0,
      threads,
    };
  })
  .filter((c): c is NonNullable<typeof c> => c !== null);

const BW = LEAD + CASES.length * PW + TAIL;

export function Casework() {
  const section = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sec = section.current;
    const bd = board.current;
    if (!sec || !bd) return;
    const wide = window.matchMedia("(min-width: 860px)");
    const panels = [...bd.querySelectorAll<Element>(".bd-case, .bd-threads")];
    const g = { s: 1, a: 0, b: 0, span: 1, vw: 0, vh: 0, on: -2 };
    let raf = 0;
    let visible = false;

    const measure = () => {
      if (!wide.matches) {
        sec.style.height = "";
        bd.style.transform = "";
        panels.forEach((p) => p.classList.add("on"));
        return;
      }
      g.vw = window.innerWidth;
      g.vh = window.innerHeight;
      g.s = Math.min(1.1, Math.max(0.5, (g.vh * 0.68) / BH));
      g.a = g.vw * 0.06;
      g.b = g.vw * 0.94 - BW * g.s;
      const travel = Math.max(1, g.a - g.b);
      sec.style.height = `${Math.round(travel * 1.1 + g.vh)}px`;
      g.span = Math.max(1, sec.offsetHeight - g.vh);
      bd.style.setProperty("--s", String(g.s));
      bd.style.top = `${Math.round(g.vh * 0.56 - (BH * g.s) / 2)}px`;
      g.on = -2;
      frame();
    };

    const frame = () => {
      if (!wide.matches) return;
      const p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / g.span));
      const tx = g.a + (g.b - g.a) * p;
      bd.style.transform = `translate3d(${tx.toFixed(1)}px,0,0) scale(${g.s})`;
      const centre = (g.vw / 2 - tx) / g.s;
      const idx = Math.min(CASES.length - 1, Math.floor((centre - LEAD + PW * 0.3) / PW));
      if (idx !== g.on) {
        g.on = idx;
        panels.forEach((el) => el.classList.toggle("on", Number((el as HTMLElement).dataset.i) <= idx));
        const c = CASES[Math.max(0, idx)];
        if (counter.current) counter.current.textContent = idx < 0 ? `${CASES.length} cases` : `Case ${c.num} / 0${CASES.length} · ${c.short}`;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible) frame();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(sec);

    /** The scroll position that puts case i in the middle of the screen. */
    const yFor = (i: number) => {
      const tx = g.vw / 2 - (LEAD + i * PW + PW / 2) * g.s;
      const p = Math.min(1, Math.max(0, (tx - g.a) / (g.b - g.a)));
      const top = sec.getBoundingClientRect().top + window.scrollY;
      return top + p * Math.max(1, sec.offsetHeight - window.innerHeight);
    };
    const go = (slug: string, smooth: boolean) => {
      const i = CASES.findIndex((c) => c.slug === slug);
      if (i < 0 || !wide.matches) return false;
      const y = yFor(i);
      const ev = new CustomEvent("smooth:to", { detail: { y, immediate: !smooth }, cancelable: true });
      if (window.dispatchEvent(ev)) window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
      return true;
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']");
      const slug = a?.getAttribute("href")?.slice(1);
      if (slug && go(slug, true)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);

    measure();
    raf = requestAnimationFrame(loop);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    wide.addEventListener("change", onResize);
    const hash = location.hash.slice(1);
    const deep = hash ? window.setTimeout(() => go(hash, false), 400) : 0;

    return () => {
      window.clearTimeout(deep);
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", onResize);
      wide.removeEventListener("change", onResize);
    };
  }, []);

  return (
    <section id="casework" ref={section} className="bd" aria-labelledby="casework-title">
      <div className="bd-stage">
        <div className="bd-lamp" aria-hidden="true" />
        <header className="bd-top gutter">
          <p className="mono-label text-mark">Casework · proof on the board</p>
          <h2 id="casework-title" className="bd-title">
            Five briefs. What I built. What changed.
          </h2>
        </header>

        <div ref={board} className="bd-board" style={{ "--bw": BW } as CSSProperties}>
          <div className="bd-cork" aria-hidden="true" />
          <svg className="bd-yarn" viewBox={`0 0 ${BW} ${BH}`} aria-hidden="true">
            {CASES.map((c) => (
              <g key={c.slug} className="bd-threads" data-i={c.i} transform={`translate(${c.x0} 0)`}>
                {c.threads.map((d, k) => (
                  <g key={k} style={{ "--d": `${0.25 + k * 0.18}s` } as CSSProperties}>
                    <path className="sh" d={d} pathLength={1} />
                    <path className="y" d={d} pathLength={1} />
                    <path className="hi" d={d} pathLength={1} />
                  </g>
                ))}
              </g>
            ))}
          </svg>

          <div className="bd-lead">
            <div className="bd-it bd-card bd-dark" style={pos({ x: 70, y: 70, w: 290, r: -2 })}>
              <i className="bd-pin" />
              <p className="bd-k">The board</p>
              <p className="bd-t">Casework</p>
            </div>
            <div className="bd-it bd-card" style={pos({ x: 60, y: 250, w: 300, r: 1.4 })}>
              <i className="bd-pin" />
              <p className="bd-k">How to read it</p>
              <p className="bd-p">Each case is the client&rsquo;s problem, a photo of the proof, what I built, and the results tied on with yarn.</p>
            </div>
            <div className="bd-it bd-note" style={pos({ x: 120, y: 470, w: 220, r: -3 })}>
              <i className="bd-pin" />
              <p className="bd-hand">Scroll along the board &rarr;</p>
            </div>
          </div>

          {CASES.map((c) => (
            <article key={c.slug} id={c.slug} className="bd-case" data-i={c.i} style={{ "--px": c.x0 } as CSSProperties}>
              <div className="bd-it bd-card bd-dark" style={pos(c.L.head)}>
                <i className="bd-pin" />
                <p className="bd-k">
                  Case {c.num} · {c.discipline} · {c.place}
                </p>
                <h3 className="bd-t">{c.short}</h3>
                <p className="sr-only">{c.name}</p>
              </div>
              <div className="bd-it bd-card" style={pos(c.L.problem)}>
                <i className="bd-pin tr" />
                <p className="bd-k">The problem</p>
                <p className="bd-q">
                  &ldquo;<Marked text={c.problem} />&rdquo;
                </p>
              </div>
              <figure className={`bd-it bd-photo${c.phone ? " tall" : ""}`} style={pos(c.L.photo)}>
                <span className="bd-tape" aria-hidden="true" />
                <i className="bd-pin tl" />
                <i className="bd-pin tr" />
                <span className="bd-img">
                  {c.image && (
                    <Image src={c.image} alt={`${c.name}: ${c.caption}`} fill sizes={c.phone ? "280px" : "(min-width: 860px) 500px, 90vw"} className="object-cover object-top" />
                  )}
                </span>
                <figcaption className="bd-hand">{c.caption}</figcaption>
              </figure>
              <div className="bd-it bd-card" style={pos(c.L.built)}>
                <i className="bd-pin" />
                <p className="bd-k">What I built</p>
                <ol className="bd-list">
                  {c.built.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ol>
              </div>
              <ul className="bd-it bd-stack" style={pos(c.L.stack)} aria-label="Stack">
                {c.stack.map((s, k) => (
                  <li key={s} style={{ "--t": `${(k % 2 ? 1 : -1) * (0.6 + k * 0.3)}deg` } as CSSProperties}>
                    {s}
                  </li>
                ))}
              </ul>
              <ul className="bd-results" aria-label="Results">
                {c.results.map((r, k) => (
                  <li key={r} className="bd-it bd-note" style={{ ...pos(c.L.results[k]), "--d": `${0.35 + k * 0.16}s` } as CSSProperties}>
                    <i className="bd-pin tl" />
                    <p className="bd-hand">{r}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <div className="bd-tail" style={{ "--px": LEAD + CASES.length * PW } as CSSProperties}>
            <a href="#contact" className="bd-it bd-card bd-blank" style={pos({ x: 20, y: 150, w: 320, r: 1.5 })} data-hover>
              <i className="bd-pin" />
              <p className="bd-k">Case 06</p>
              <p className="bd-hand big">Your problem here.</p>
              <p className="bd-k">Send it in one line &rarr;</p>
            </a>
          </div>
        </div>

        <div className="bd-light" aria-hidden="true" />
        <footer className="bd-foot gutter" aria-hidden="true">
          <span ref={counter} className="mono-label">
            {CASES.length} cases
          </span>
          <span className="bd-bar">
            <span ref={bar} />
          </span>
        </footer>
      </div>
    </section>
  );
}
