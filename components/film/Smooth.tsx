"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Smooth scroll (Lenis) wired into GSAP ScrollTrigger. Off under reduced motion. */
export function Smooth() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href") ?? "";
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.4 });
    };
    document.addEventListener("click", onClick);
    // other components can ask for a smooth scroll to a y position (the casework board does)
    const onTo = (e: Event) => {
      const { y, immediate } = (e as CustomEvent<{ y: number; immediate?: boolean }>).detail;
      e.preventDefault();
      lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.4 });
    };
    window.addEventListener("smooth:to", onTo);
    return () => {
      window.removeEventListener("smooth:to", onTo);
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}
