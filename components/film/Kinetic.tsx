"use client";

import { useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";

/**
 * Letters that fly in from scattered positions and assemble into the line.
 * Words stay whole, so long lines wrap at word boundaries.
 * `trigger="on"` waits for the boot sequence; `trigger="view"` fires when the
 * element scrolls into view.
 */
export function Kinetic({
  text,
  as: Tag = "span",
  className = "",
  trigger = "view",
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  trigger?: "on" | "view";
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".ch"));
    let played = false;
    let cleanup: (() => void) | null = null;

    gsap.set(chars, {
      opacity: 0,
      filter: "blur(6px)",
      x: () => (Math.random() - 0.5) * 900,
      y: () => (Math.random() - 0.5) * 500,
      rotation: () => (Math.random() - 0.5) * 60,
    });

    const play = () => {
      if (played) return;
      played = true;
      gsap.to(chars, {
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
        rotation: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: { each: stagger, from: "random" },
        delay,
        overwrite: true,
      });
    };

    if (trigger === "on") {
      if (document.documentElement.dataset.on === "1") play();
      else {
        window.addEventListener("film:on", play, { once: true });
        cleanup = () => window.removeEventListener("film:on", play);
      }
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            play();
            io.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(el);
      cleanup = () => io.disconnect();
    }
    return () => {
      cleanup?.();
      gsap.killTweensOf(chars);
    };
  }, [trigger, delay, stagger]);

  const words = text.split(" ");
  return (
    <Tag ref={ref} className={`kin ${className}`} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true">
          <span className="w">
            {Array.from(word).map((c, i) => (
              <span key={i} className="ch">
                {c}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
