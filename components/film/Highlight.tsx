"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** A word with a hand-drawn highlighter stroke that draws itself when seen. */
export function Highlight({
  children,
  trigger = "view",
  delay = 0,
  variant = "stroke",
}: {
  children: ReactNode;
  trigger?: "on" | "view";
  delay?: number;
  /** "stroke" draws a hand-drawn marker behind one word; "fill" paints a wrapping phrase line by line. */
  variant?: "stroke" | "fill";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const on = () => {
      timer = window.setTimeout(() => el.classList.add("on"), delay * 1000);
    };
    if (trigger === "on") {
      if (document.documentElement.dataset.on === "1") on();
      else window.addEventListener("film:on", on, { once: true });
      return () => {
        window.removeEventListener("film:on", on);
        clearTimeout(timer);
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          on();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [trigger, delay]);
  if (variant === "fill") {
    return (
      <span ref={ref} className="hlf">
        <span>{children}</span>
      </span>
    );
  }
  return (
    <span ref={ref} className="hlw">
      <span>{children}</span>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M3 21 C 22 17, 40 25, 58 20 S 88 23, 97 19" />
      </svg>
    </span>
  );
}
