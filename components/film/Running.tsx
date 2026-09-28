"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { running } from "@/content/film";

/** Three numbers that count up when seen. Each carries its source. */
export function Running() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-on");
      return;
    }
    const nums = Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));
    nums.forEach((n) => (n.textContent = "0"));
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        nums.forEach((n, i) => {
          const target = Number(n.dataset.count);
          const o = { v: 0 };
          gsap.to(o, { v: target, duration: 1.6, delay: i * 0.15, ease: "power3.out", onUpdate: () => (n.textContent = String(Math.round(o.v))) });
        });
        el.classList.add("is-on");
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="running" ref={ref} className="screen gutter">
      <div className="mono-label mb-10 text-grey">Running now</div>
      <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
        {running.map((r, i) => (
          <div key={r.label} className="flex flex-col gap-3">
            <div className="display tabular text-[clamp(84px,12vw,200px)] leading-none text-ink">
              <span data-count={r.value}>{r.value}</span>
            </div>
            <div className="h-[3px] w-0 bg-mark transition-[width] duration-700 [.is-on_&]:w-24" style={{ transitionDelay: `${i * 0.15}s` }} aria-hidden="true" />
            <div className="display text-[clamp(22px,2.6vw,36px)] text-ink">{r.label}</div>
            <div className="mono-label max-w-[34ch] text-grey">{r.source}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
