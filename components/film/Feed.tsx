"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { hero, night, story } from "@/content/film";
import { Highlight } from "./Highlight";
import { Logo, MARKS } from "./Marks";
import { Kinetic } from "./Kinetic";

/**
 * Screen 01, the feed: one working day as a desk with two columns. "Today in AI" on the left
 * fills with the day's updates as you scroll; each gets stamped KEEP or SKIP, the rejects fade,
 * the keepers get wired across to the client problem they solved, and the result ticks in.
 * The section is tall and its stage is pinned; scroll progress (0..1) drives everything, and
 * the chapter captions on the left swap with it. All text and SVG, so it is sharp at any size.
 */

/** Scroll windows for the opening, the four chapters and the close. */
const WIN: [number, number][] = [
  [-1, 0.1],
  [0.12, 0.29],
  [0.31, 0.49],
  [0.51, 0.69],
  [0.71, 0.89],
  [0.93, 2],
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
function today() {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
/** The clock runs from 06:10 to 23:41 across the film. */
function clockText(day: string, p: number) {
  const mins = 6 * 60 + 10 + Math.round(clamp01(p / 0.9) * (17 * 60 + 31));
  const h = String(Math.floor(mins / 60) % 24).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${day} · ${h}:${m}`;
}

const KEEPERS = night.updates.map((u, i) => ({ u, i })).filter((x) => x.u.keep);

export function Feed() {
  const section = useRef<HTMLElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const probs = useRef<HTMLDivElement>(null);
  const wire = useRef<SVGSVGElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const chapters = useRef<(HTMLElement | null)[]>([]);
  const ticks = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const sec = section.current;
    const fd = feed.current;
    const pc = probs.current;
    const sv = wire.current;
    if (!sec || !fd || !pc || !sv) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const day = today();
    const items = [...fd.querySelectorAll<HTMLElement>(".fd-item")];
    const problems = [...pc.querySelectorAll<HTMLElement>(".fd-prob")];
    const paths = [...sv.querySelectorAll<SVGPathElement>("path")];
    const c: Record<string, HTMLElement> = {};
    sec.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      c[el.dataset.count!] = el;
    });
    let raf = 0;
    let visible = true;
    let p = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!visible) return;
      const r = sec.getBoundingClientRect();
      const tp = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
      p = reduce ? tp : p + (tp - p) * (1 - Math.exp(-dt * 7));

      chapters.current.forEach((el, i) => {
        if (!el) return;
        const [a, b] = WIN[i];
        const o =
          seg(p, a - 0.006, a + 0.012) * (1 - seg(p, b - 0.012, b + 0.006));
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 14}px)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      ticks.current.forEach((el, i) =>
        el?.classList.toggle(
          "on",
          p >= WIN[i + 1][0] - 0.01 && p < WIN[i + 1][1] + 0.01,
        ),
      );
      if (clock.current) clock.current.textContent = clockText(day, p);

      // arrivals through chapter 01, stamps through 02, wires through 03, results through 04
      let read = 0;
      let tested = 0;
      let kept = 0;
      let skipped = 0;
      items.forEach((el, i) => {
        const u = night.updates[i];
        const arrive = p > 0.11 + i * 0.018;
        const stamp = p > 0.32 + i * 0.016;
        el.classList.toggle("in", arrive);
        if (arrive) read++;
        el.classList.toggle(u.keep ? "keep" : "skip", stamp);
        if (stamp) {
          tested++;
          if (u.keep) kept++;
          else skipped++;
        }
        if (!u.keep) el.classList.toggle("gone", p > 0.62 + i * 0.01);
      });
      const fr = sv.getBoundingClientRect();
      let solved = 0;
      KEEPERS.forEach(({ u, i }, k) => {
        const on = p > 0.53 + k * 0.03;
        paths[k].classList.toggle("on", on);
        if (on && u.to !== undefined) {
          const a = items[i].getBoundingClientRect();
          const b = problems[u.to].getBoundingClientRect();
          const x1 = a.right - fr.left;
          const y1 = a.top + a.height / 2 - fr.top;
          const x2 = b.left - fr.left;
          const y2 = b.top + 24 - fr.top;
          paths[k].setAttribute(
            "d",
            `M${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`,
          );
        }
        const done = p > 0.72 + k * 0.035;
        if (u.to !== undefined) problems[u.to].classList.toggle("done", done);
        if (done) solved++;
      });
      if (c.new) c.new.textContent = `${read} new`;
      if (c.solved)
        c.solved.textContent = `${solved} / ${night.problems.length} solved`;
      if (c.read) c.read.textContent = String(read);
      if (c.tested) c.tested.textContent = String(tested);
      if (c.kept) c.kept.textContent = String(kept);
      if (c.skipped) c.skipped.textContent = String(skipped);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(sec);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section
      id="top"
      ref={section}
      className="fd"
      aria-label="One day of work, told in four chapters"
    >
      <div className="fd-stage">
        <div className="fd-desk">
          <div className="fd-col">
            <div className="fd-colh">
              <span>This month in AI</span>
              <b data-count="new">0 new</b>
            </div>
            <div ref={feed} className="fd-list">
              {night.updates.map((u) => (
                <article key={u.t} className="fd-item">
                  <span className="fd-tile" style={{ "--bc": MARKS[u.mark].color } as CSSProperties}>
                    <Logo mark={u.mark} />
                  </span>
                  <div className="fd-body">
                    <div className="fd-meta">
                      <b>{u.src}</b>
                      <i className="fd-sep" aria-hidden="true" />
                      <span className="fd-dom">{u.domain}</span>
                      <span className="fd-date tabular">{u.date}</span>
                    </div>
                    <p className="fd-t">{u.t}</p>
                    <p className="fd-desc">{u.line}</p>
                    <p className="fd-why">
                      {u.keep && u.to !== undefined ? `→ ${night.problems[u.to].who} · ` : ""}
                      {u.why}
                    </p>
                  </div>
                  <span className="fd-stamp" aria-hidden="true">
                    {u.keep ? "KEEP" : "SKIP"}
                  </span>
                  <i className="fd-dot" aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
          <div className="fd-col">
            <div className="fd-colh">
              <span>Client problems</span>
              <b data-count="solved">0 / {night.problems.length} solved</b>
            </div>
            <div ref={probs} className="fd-list">
              {night.problems.map((pr) => (
                <div key={pr.who} className="fd-prob">
                  <div className="fd-who">{pr.who}</div>
                  <p className="fd-q">“{pr.q}”</p>
                  <div className="fd-r">{pr.r}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fd-foot">
            <div className="fd-tally" aria-hidden="true">
              <span>
                read<b data-count="read">0</b>
              </span>
              <span>
                tested<b data-count="tested">0</b>
              </span>
              <span className="k">
                kept<b data-count="kept">0</b>
              </span>
              <span>
                rejected<b data-count="skipped">0</b>
              </span>
            </div>
            <span
              ref={clock}
              className="fd-clock mono-label tabular"
              aria-hidden="true"
            >
              TODAY · 06:10
            </span>
          </div>
          <svg ref={wire} className="fd-wire" aria-hidden="true">
            {KEEPERS.map(({ u }) => (
              <path key={u.t} pathLength={1} />
            ))}
          </svg>
        </div>

        <div className="fd-rail" aria-hidden="true">
          {story.chapters.map((c, i) => (
            <i
              key={c.n}
              ref={(el) => {
                ticks.current[i] = el;
              }}
            />
          ))}
        </div>

        <div className="fd-copy">
          <article
            ref={(el) => {
              chapters.current[0] = el;
            }}
            className="fd-ch fd-wide"
          >
            <div>
              <p className="fd-kicker">{hero.kicker}</p>
              <h1 className="fd-h1">
                <Kinetic as="span" text={hero.line1} trigger="on" />{" "}
                <Kinetic as="span" text={hero.line2} trigger="on" delay={0.4} />{" "}
                <Highlight trigger="on" delay={1.5} variant="fill">
                  <Kinetic
                    as="span"
                    text={hero.word}
                    trigger="on"
                    delay={0.7}
                  />
                </Highlight>
              </h1>
              <p className="fd-line">{hero.sub}</p>
            </div>
          </article>

          {story.chapters.map((c, i) => (
            <article
              key={c.n}
              ref={(el) => {
                chapters.current[i + 1] = el;
              }}
              className="fd-ch"
              style={{ opacity: 0, visibility: "hidden" } as CSSProperties}
            >
              <div>
                <p className="fd-num">
                  {c.n} / 0{story.chapters.length}
                </p>
                <p className="fd-kicker">{c.kicker}</p>
                <h2 className="fd-h2">{c.title}</h2>
                <p className="fd-line">{c.line}</p>
              </div>
            </article>
          ))}

          <article
            ref={(el) => {
              chapters.current[story.chapters.length + 1] = el;
            }}
            className="fd-ch fd-wide"
            style={{ opacity: 0, visibility: "hidden" } as CSSProperties}
          >
            <div>
              <p className="fd-kicker">{story.close}</p>
              <p className="fd-h1" aria-hidden="true">
                {hero.line1} {hero.line2}{" "}
                <span className="mark">{hero.word}</span>
              </p>
              <div className="fd-cta">
                <a href="#contact" className="fd-pri" data-hover>
                  {hero.primary}
                </a>
                <a href="#casework" className="fd-sec" data-hover>
                  {hero.secondary}
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
