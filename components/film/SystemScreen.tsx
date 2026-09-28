"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { caseTitle, system } from "@/content/film";
import { CanvasScene } from "./CanvasScene";
import { Kinetic } from "./Kinetic";

/** The canvas, pinned: scroll drives the camera through the graph; hover names the case. */
export function SystemScreen() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [hover, setHover] = useState<{ slug: string | null; name: string | null }>({ slug: null, name: null });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        progress.current = s.progress;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section id="systems" ref={ref} className="relative h-[300svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <CanvasScene mode="system" className="block h-full w-full" progressRef={progress} onHover={(slug, name) => setHover({ slug, name })} />
        </div>
        <div className="gutter pointer-events-none absolute inset-x-0 top-[18%] z-10">
          <h2 className="display max-w-[16ch] text-[clamp(30px,4.6vw,72px)] text-ink">
            <Kinetic as="span" text={system.line} />
          </h2>
          <p className="mono-label mt-4 text-grey">{system.hint}</p>
        </div>
        <div className="gutter pointer-events-none absolute inset-x-0 bottom-[14%] z-10">
          <div className={`inline-flex flex-col gap-1 border-l-[3px] border-mark pl-3 transition-opacity ${hover.name ? "opacity-100" : "opacity-0"}`} aria-live="polite">
            <span className="mono-label text-mark">{hover.name}</span>
            <span className="text-[15px] text-ink">{hover.slug ? caseTitle(hover.slug) : ""}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
