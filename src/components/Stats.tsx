"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { stats, techMarquee } from "@/content/profile";

/** Counts from zero to `value` the first time it scrolls into view. */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    // Reduced motion skips the animation entirely and renders the final value.
    if (!inView || reduced) return;

    const duration = 1400;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic so the number decelerates into its final value.
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, reduced]);

  const display = reduced ? value : animated;

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative border-y border-line bg-bg-soft py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-6 sm:px-10 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
              <Counter value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="mt-2 text-sm font-medium text-fg">{stat.label}</div>
            <div className="mt-1 text-xs leading-relaxed text-faint">{stat.detail}</div>
          </div>
        ))}
      </div>

      <div className="relative mt-16 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        {/* Duplicated track so the -50% translate loops seamlessly. */}
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {[...techMarquee, ...techMarquee].map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              className="font-mono text-sm whitespace-nowrap text-faint"
            >
              {tech}
              <span className="ml-10 text-line">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
