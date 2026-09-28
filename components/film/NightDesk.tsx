"use client";

import { useEffect, useRef, useState } from "react";
import { getImageProps } from "next/image";
import { hero, night, story } from "@/content/film";
import { Highlight } from "./Highlight";
import { Kinetic } from "./Kinetic";

/**
 * Screen 01, the Night desk film. The section is tall and its stage is pinned; scroll
 * progress (0..1) moves the camera through the 3D scene in components/film/night and
 * swaps the chapter captions on the left. A poster of the first frame shows until the
 * scene has rendered, and stays if WebGL is not available.
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

const posterCommon = { alt: "", sizes: "100vw", quality: 75 };
const posterWide = getImageProps({ ...posterCommon, src: "/hero/night-desk.jpg", width: 1600, height: 1000 }).props;
const posterTall = getImageProps({ ...posterCommon, src: "/hero/night-desk-portrait.jpg", width: 780, height: 1688 }).props;

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
    if (!sec || !cv || !fr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const day = today();
    let raf = 0;
    let stopped = false;
    let visible = true;
    let shown = false;
    let p = 0;
    let last = performance.now();
    const t0 = last;
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

    type World = Awaited<ReturnType<typeof boot>>;
    let world: World | null = null;

    async function boot(el: HTMLCanvasElement) {
      const [mod, THREE] = await Promise.all([import("./night/scene"), import("three")]);
      const person = mod.loadPerson("/hero/person.glb");
      const css = getComputedStyle(document.documentElement);
      const fam = (v: string, fallback: string) => {
        const f = css.getPropertyValue(v).trim();
        return f ? `${f}, ${fallback}` : fallback;
      };
      const fonts = {
        mono: fam("--font-jetbrains", "ui-monospace, Menlo, monospace"),
        sans: fam("--font-archivo", "Arial, sans-serif"),
        serif: fam("--font-gloock", "Georgia, serif"),
      };
      mod.setFonts(fonts);
      await Promise.all(
        [`600 21px ${fonts.mono}`, `700 33px ${fonts.sans}`, `400 38px ${fonts.serif}`].map((f) =>
          document.fonts.load(f).catch(() => []),
        ),
      );
      const stage = new mod.Stage(el, { dprMax: window.innerWidth < 760 ? 1.5 : 1.35 });
      const scene = mod.buildNight(night, await person);
      const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 60);
      return {
        stage,
        scene,
        camera,
        pos: new THREE.Vector3(),
        look: new THREE.Vector3(),
        right: new THREE.Vector3(),
        up: new THREE.Vector3(),
        dispose: () => {
          mod.disposeScene(scene.scene);
          stage.dispose();
        },
      };
    }

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
      p = reduce ? tp : p + (tp - p) * (1 - Math.exp(-dt * 6));

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

      if (!world) return;
      const { stage, scene, camera, pos, look, right, up } = world;
      stage.resize(W, H);
      camera.aspect = W / H;
      let fov = scene.path.at(p, pos, look);
      if (narrow) fov *= 1.14;
      camera.fov = fov;
      if (!reduce) {
        mouse.sx += (mouse.x - mouse.sx) * 0.05;
        mouse.sy += (mouse.y - mouse.sy) * 0.05;
      }
      camera.position.copy(pos);
      camera.lookAt(look);
      right.setFromMatrixColumn(camera.matrix, 0);
      up.setFromMatrixColumn(camera.matrix, 1);
      const amp = pos.distanceTo(look) * 0.018;
      camera.position.addScaledVector(right, mouse.sx * amp).addScaledVector(up, -mouse.sy * amp * 0.6);
      camera.lookAt(look);
      // keep the subject centred in the part of the frame beside the captions
      const aimLeft = narrow ? left : Math.round(W * 0.38);
      const cx = (aimLeft + (W - rightIn)) / 2;
      const cy = (top + (H - bottom)) / 2;
      camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
      camera.updateProjectionMatrix();
      const t = (now - t0) / 1000;
      scene.update(p, t);
      stage.render(scene.scene, camera, t);
      if (!shown) {
        shown = true;
        setLive(true);
      }
    };
    raf = requestAnimationFrame(tick);

    boot(cv)
      .then((w) => {
        if (stopped) w.dispose();
        else world = w;
      })
      .catch(() => {
        /* no WebGL: the poster stays */
      });

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      world?.dispose();
      world = null;
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
