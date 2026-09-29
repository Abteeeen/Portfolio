"use client";

import { useEffect, useRef, useState } from "react";
import { getImageProps } from "next/image";
import { hero, story } from "@/content/film";
import { Highlight } from "./Highlight";
import { Kinetic } from "./Kinetic";

/**
 * Screen 01, the Night desk film. The section is tall and its stage is pinned; scroll progress
 * (0..1) scrubs through 180 frames rendered in Blender (Cycles) from the scene in
 * components/film/night, and swaps the chapter captions on the left. The frames live in
 * public/hero/frames; scripts/night-desk explains how they are made. A poster of the first frame
 * shows until the frames are ready.
 */

/** Frames in public/hero/frames, 0001.webp to 0180.webp. Phones load every other one; until a frame
 * has loaded, the nearest one that has stands in. */
const FRAMES = 180;
const frameUrl = (i: number) => `/hero/frames/${String(i + 1).padStart(4, "0")}.webp`;

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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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

/** Coarse frames first so scrubbing works early, then the gaps fill in. */
function loadOrder(step: number) {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const stride of [32, 16, 8, 4, 2, 1]) {
    if (stride < step) break;
    for (let i = 0; i < FRAMES; i += stride) {
      if (seen.has(i)) continue;
      seen.add(i);
      order.push(i);
    }
  }
  if (!seen.has(FRAMES - 1)) order.push(FRAMES - 1);
  return order;
}

const posterCommon = { alt: "", sizes: "100vw", quality: 75 };
const posterWide = getImageProps({ ...posterCommon, src: "/hero/night-desk.jpg", width: 1152, height: 720 }).props;
const posterTall = getImageProps({ ...posterCommon, src: "/hero/night-desk-portrait.jpg", width: 576, height: 720 }).props;

export function NightDesk() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const chapters = useRef<(HTMLElement | null)[]>([]);
  const ticks = useRef<(HTMLElement | null)[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const sec = section.current;
    const cv = canvas.current;
    const fr = frame.current;
    const ctx = cv?.getContext("2d", { alpha: false });
    if (!sec || !cv || !fr || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const day = today();
    let raf = 0;
    let visible = true;
    let shown = false;
    let p = 0;
    let last = performance.now();
    let drawn = "";
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

    // phones take every other frame; the player blends between whatever has loaded
    const step = window.innerWidth < 760 ? 2 : 1;
    const imgs: (HTMLImageElement | null)[] = new Array(FRAMES).fill(null);
    const order = loadOrder(step);
    let cursor = 0;
    let stopped = false;
    const pump = () => {
      if (stopped || cursor >= order.length) return;
      const i = order[cursor++];
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(i);
      img
        .decode()
        .then(() => {
          imgs[i] = img;
          drawn = "";
        })
        .catch(() => {})
        .finally(pump);
    };
    for (let k = 0; k < 6; k++) pump();

    const nearest = (i: number, dir: number) => {
      for (let d = 0; d < FRAMES; d++) {
        const j = i + d * dir;
        if (j < 0 || j >= FRAMES) break;
        if (imgs[j]) return j;
      }
      return -1;
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(sec);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!visible) return;
      const r = sec.getBoundingClientRect();
      const tp = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
      p = reduce ? tp : p + (tp - p) * (1 - Math.exp(-dt * 7));

      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const narrow = W < 760;
      const top = narrow ? 60 : 64;
      const rightIn = narrow ? 12 : 16;
      const bottom = narrow ? Math.round(H * 0.42) : 56;
      const open = seg(p, 0.05, 0.13) - seg(p, 0.89, 0.95);
      const left = narrow ? 12 : lerp(16, Math.round(W * 0.38), open);
      fr.style.clipPath = `inset(${top}px ${rightIn}px ${bottom}px ${left}px round 4px)`;
      if (scrim.current) scrim.current.style.opacity = narrow ? "0" : String(1 - open);
      chapters.current.forEach((el, i) => {
        if (!el) return;
        const [a, b] = WIN[i];
        const o = seg(p, a - 0.006, a + 0.012) * (1 - seg(p, b - 0.012, b + 0.006));
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 14}px)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      ticks.current.forEach((el, i) => el?.classList.toggle("on", p >= WIN[i + 1][0] - 0.01 && p < WIN[i + 1][1] + 0.01));
      if (clock.current) clock.current.textContent = clockText(day, p);

      // the frame for this scroll position (the nearest one that has loaded)
      const fi = Math.round(p * (FRAMES - 1));
      const lo = nearest(fi, -1);
      const hi = nearest(fi, 1);
      if (lo < 0 && hi < 0) return;
      const pick = lo < 0 ? hi : hi < 0 ? lo : fi - lo <= hi - fi ? lo : hi;
      if (!reduce) {
        mouse.sx += (mouse.x - mouse.sx) * 0.05;
        mouse.sy += (mouse.y - mouse.sy) * 0.05;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = Math.round(W * dpr);
      const ch = Math.round(H * dpr);
      // the picture is fitted to the part of the frame beside the captions (full width at the ends)
      const rx = narrow ? 0 : lerp(0, W * 0.38, open);
      const rh = narrow ? H * 0.58 : H;
      const key = `${cw}x${ch}|${pick}|${rx.toFixed(1)}|${mouse.sx.toFixed(3)}|${mouse.sy.toFixed(3)}`;
      if (key === drawn) return;
      drawn = key;
      if (cv.width !== cw || cv.height !== ch) {
        cv.width = cw;
        cv.height = ch;
      }
      const img = imgs[pick]!;
      const rw = W - rx;
      const sc = Math.max(rw / img.naturalWidth, rh / img.naturalHeight) * 1.03;
      const dw = img.naturalWidth * sc;
      const dh = img.naturalHeight * sc;
      const px = rx + (rw - dw) / 2 + mouse.sx * rw * 0.012;
      const py = (rh - dh) / 2 + mouse.sy * rh * 0.012;
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, px * dpr, py * dpr, dw * dpr, dh * dpr);
      if (!shown && imgs[0]) {
        shown = true;
        setLive(true);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section id="top" ref={section} className="nd" aria-label="One day of work, told in four chapters">
      <div className="nd-stage">
        <div ref={frame} className="nd-frame">
          <picture>
            <source media="(max-width: 760px)" srcSet={posterTall.srcSet} />
            <img {...posterWide} className={`nd-poster${live ? " is-off" : ""}`} loading="eager" fetchPriority="high" alt="" />
          </picture>
          <canvas ref={canvas} className={`nd-canvas${live ? " is-on" : ""}`} aria-hidden="true" />
          <div ref={scrim} className="nd-scrim" aria-hidden="true" />
          <span ref={clock} className="nd-clock mono-label tabular" aria-hidden="true">
            TODAY · 06:10
          </span>
        </div>

        <div className="nd-rail" aria-hidden="true">
          {story.chapters.map((c, i) => (
            <i
              key={c.n}
              ref={(el) => {
                ticks.current[i] = el;
              }}
            />
          ))}
        </div>

        <div className="nd-copy">
          <article
            ref={(el) => {
              chapters.current[0] = el;
            }}
            className="nd-ch nd-wide"
          >
            <div>
              <p className="nd-kicker">{hero.kicker}</p>
              <h1 className="nd-h1">
                <Kinetic as="span" text={hero.line1} trigger="on" />{" "}
                <Kinetic as="span" text={hero.line2} trigger="on" delay={0.4} />{" "}
                <Highlight trigger="on" delay={1.5} variant="fill">
                  <Kinetic as="span" text={hero.word} trigger="on" delay={0.7} />
                </Highlight>
              </h1>
              <p className="nd-line">{hero.sub}</p>
            </div>
          </article>

          {story.chapters.map((c, i) => (
            <article
              key={c.n}
              ref={(el) => {
                chapters.current[i + 1] = el;
              }}
              className="nd-ch"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div>
                <p className="nd-num">
                  {c.n} / 0{story.chapters.length}
                </p>
                <p className="nd-kicker">{c.kicker}</p>
                <h2 className="nd-h2">{c.title}</h2>
                <p className="nd-line">{c.line}</p>
              </div>
            </article>
          ))}

          <article
            ref={(el) => {
              chapters.current[story.chapters.length + 1] = el;
            }}
            className="nd-ch nd-wide"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <div>
              <p className="nd-kicker">{story.close}</p>
              <p className="nd-h1" aria-hidden="true">
                {hero.line1} {hero.line2} <span className="mark">{hero.word}</span>
              </p>
              <div className="nd-cta">
                <a href="#contact" className="nd-pri" data-hover>
                  {hero.primary}
                </a>
                <a href="#casework" className="nd-sec" data-hover>
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
