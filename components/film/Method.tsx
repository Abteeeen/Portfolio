"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { method } from "@/content/film";

/** Four words under a light beam. Scroll lights them one at a time. */
export function Method() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => setActive(Math.min(method.length - 1, Math.floor(s.progress * method.length))),
    });
    return () => st.kill();
  }, []);

  return (
    <section id="method" ref={ref} className="relative h-[260svh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="beam" aria-hidden="true" />
        <div className="gutter relative z-10 w-full">
          <div className="mono-label mb-6 text-grey">Method</div>
          <ol className="flex flex-col gap-2 lg:gap-3">
            {method.map((m, i) => (
              <li key={m.word} className="flex flex-col gap-2 lg:flex-row lg:items-baseline lg:gap-8">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={`display text-left text-[clamp(44px,8.5vw,132px)] leading-none transition-colors duration-500 ${i === active ? "text-ink" : "text-dim"}`}
                >
                  {m.word}
                </button>
                <p className={`hidden max-w-[38ch] text-[clamp(15px,1.5vw,19px)] text-grey transition-opacity duration-500 md:block ${i === active ? "opacity-100" : "opacity-0"}`}>
                  {m.line}
                </p>
              </li>
            ))}
          </ol>
          <p key={active} className="method-line mt-6 max-w-[38ch] text-[15px] text-grey md:hidden">
            {method[active].line}
          </p>
        </div>
      </div>
    </section>
  );
}
