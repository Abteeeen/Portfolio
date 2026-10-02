"use client";

import { useEffect, useRef, useState } from "react";
import { nav, person } from "@/content/site";
import { ticker } from "@/content/film";

/** The persistent furniture: sigil, nav (a menu sheet on phones), sound, ticker, scroll hint, cursor. */
export function Hud() {
  const [sound, setSound] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const audio = useRef<{ ctx: AudioContext; master: GainNode } | null>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = dot.current;
    if (!el) return;
    document.body.classList.add("has-cursor");
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add("is-on");
      const big = !!(e.target as HTMLElement | null)?.closest?.("a, button, [data-hover]");
      el.classList.toggle("is-big", big);
    };
    const leave = () => el.classList.remove("is-on");
    const loop = () => {
      x += (tx - x) * 0.35;
      y += (ty - y) * 0.35;
      el.style.transform = `translate(${x - 5}px, ${y - 5}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  function toggleSound() {
    if (!audio.current) {
      try {
        const ctx = new window.AudioContext();
        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 180;
        lp.connect(master);
        const voices: [number, OscillatorType, number][] = [
          [55, "triangle", 0.5],
          [110.5, "sine", 0.25],
          [165, "sine", 0.12],
        ];
        voices.forEach(([f, type, g]) => {
          const o = ctx.createOscillator();
          o.type = type;
          o.frequency.value = f;
          const gain = ctx.createGain();
          gain.gain.value = g;
          o.connect(gain).connect(lp);
          o.start();
        });
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lg = ctx.createGain();
        lg.gain.value = 60;
        lfo.connect(lg).connect(lp.frequency);
        lfo.start();
        audio.current = { ctx, master };
      } catch {
        return;
      }
    }
    const { ctx, master } = audio.current;
    if (sound) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setSound(false);
    } else {
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 1.5);
      setSound(true);
    }
  }

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <header className="hud-top pointer-events-none fixed inset-x-0 top-0 z-[70] flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#top" className="mono-label pointer-events-auto flex items-center gap-2 text-ink">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <circle cx="5" cy="12" r="2.4" fill="#ffe94d" />
            <circle cx="19" cy="6" r="2.4" fill="#ffe94d" />
            <circle cx="19" cy="18" r="2.4" fill="#ffe94d" />
            <path d="M7 11l10-4M7 13l10 4" stroke="#ffe94d" strokeWidth="1.2" />
          </svg>
          {person.name}
        </a>
        <nav aria-label="Sections" className="pointer-events-auto hidden gap-5 md:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="mono-label text-grey transition-colors hover:text-mark">
              {n.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          aria-controls="menu"
          className="mono-label pointer-events-auto flex items-center gap-2 text-ink md:hidden"
        >
          <span className={`hud-burger ${menu ? "x" : ""}`} aria-hidden="true">
            <i />
            <i />
          </span>
          {menu ? "Close" : "Menu"}
        </button>
      </header>
      <div id="menu" className={`hud-menu md:hidden ${menu ? "on" : ""}`} aria-hidden={!menu}>
        <nav aria-label="Sections" className="flex flex-col">
          {nav.map((n, i) => (
            <a key={n.href} href={n.href} onClick={() => setMenu(false)} className="hud-link" tabIndex={menu ? 0 : -1}>
              <span className="display text-[42px] leading-none text-ink">{n.label}</span>
              <span className="mono-label text-mark">0{i + 1}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-5">
          <button type="button" onClick={toggleSound} aria-pressed={sound} className="mono-label flex items-center gap-2 text-grey" tabIndex={menu ? 0 : -1}>
            <span className={`bars ${sound ? "on" : ""}`} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            Sound {sound ? "on" : "off"}
          </button>
          <a href={`mailto:${person.email}`} className="mono-label text-ink" tabIndex={menu ? 0 : -1}>
            {person.email}
          </a>
        </div>
      </div>
      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex items-end justify-between gap-4 px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={sound}
          className="mono-label pointer-events-auto hidden items-center gap-2 text-grey transition-colors hover:text-ink md:flex"
        >
          <span className={`bars ${sound ? "on" : ""}`} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          Sound {sound ? "on" : "off"}
        </button>
        <div className="ticker mono-label hidden flex-1 text-grey md:block" aria-hidden="true">
          <div>
            {ticker.map((e) => (
              <span key={e.t}>
                <b className="font-medium text-mark">{e.t}</b> {e.n} · {e.m} &nbsp;·&nbsp;{" "}
              </span>
            ))}
            measure · automate · report &nbsp;·&nbsp;
          </div>
        </div>
        <span className={`mono-label ml-auto text-grey transition-opacity ${scrolled || menu ? "opacity-0" : "opacity-100"}`} aria-hidden="true">
          Scroll ↓
        </span>
      </footer>
    </>
  );
}
