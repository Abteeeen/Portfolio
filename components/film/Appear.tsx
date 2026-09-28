"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/** Fades a block in when the boot ends or when it scrolls into view. */
export function Appear({
  children,
  as: Tag = "div",
  className = "",
  trigger = "view",
  delay = 0,
  band = false,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  trigger?: "on" | "view";
  delay?: number;
  band?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => el.classList.add("is-on");
    if (trigger === "on") {
      if (document.documentElement.dataset.on === "1") on();
      else window.addEventListener("film:on", on, { once: true });
      return () => window.removeEventListener("film:on", on);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          on();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);
  return (
    <Tag ref={ref} className={`${band ? "band" : "appear"} ${className}`} style={{ "--d": `${delay}s` } as CSSProperties}>
      {children}
    </Tag>
  );
}
