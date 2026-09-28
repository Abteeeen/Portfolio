"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Draws the highlighter marks inside when the block scrolls into view.
 * The effect writes the `data-reveal` attribute straight to the DOM:
 * "" means undrawn, "in" means drawn.
 *
 * `initial="hidden"` renders undrawn (use above the fold, where JS runs before
 * paint). `initial="visible"` renders drawn on the server and only resets to
 * undrawn if the block is off-screen on mount, so a reader without JS still
 * sees the marks.
 */
export function Reveal({
  children,
  initial = "visible",
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  initial?: "hidden" | "visible";
  className?: string;
  as?: "div" | "section" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.setAttribute("data-reveal", "in");
      return;
    }
    const rect = el.getBoundingClientRect();
    const onScreen = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    if (initial === "hidden" && onScreen) {
      const id = requestAnimationFrame(() => el.setAttribute("data-reveal", "in"));
      return () => cancelAnimationFrame(id);
    }
    if (initial === "visible" && onScreen) return; // already drawn, leave it
    if (initial === "visible") el.setAttribute("data-reveal", "");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute("data-reveal", "in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [initial]);

  const attrs = initial === "hidden" ? { "data-reveal": "" } : {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp ref={ref} className={className} {...attrs}>
      {children}
    </Comp>
  );
}
