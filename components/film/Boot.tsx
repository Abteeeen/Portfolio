"use client";

import { useEffect, useState } from "react";
import { boot } from "@/content/film";

/**
 * The power-on sequence: 1.8 seconds, skippable with a click or a key, and
 * skipped for the rest of the session once seen. Fires `film:on` when done so
 * the hero can start its letters.
 */
export function Boot() {
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<"on" | "fading" | "gone">("on");

  useEffect(() => {
    let finished = false;
    const timers: number[] = [];
    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      try {
        sessionStorage.setItem("booted", "1");
      } catch {}
      document.documentElement.dataset.on = "1";
      window.dispatchEvent(new Event("film:on"));
      setPhase("fading");
      timers.push(window.setTimeout(() => setPhase("gone"), 520));
    };
    let skip = false;
    try {
      skip = sessionStorage.getItem("booted") === "1";
    } catch {}
    if (skip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.push(window.setTimeout(finish, 0));
      return () => timers.forEach(clearTimeout);
    }
    boot.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 220 + i * 260)));
    timers.push(window.setTimeout(() => setShown(boot.length + 1), 220 + boot.length * 260));
    timers.push(window.setTimeout(finish, 1900));
    const onSkip = () => finish();
    window.addEventListener("keydown", onSkip);
    window.addEventListener("pointerdown", onSkip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("pointerdown", onSkip);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-paper transition-opacity duration-500 ${phase === "fading" ? "opacity-0" : "opacity-100"}`}
    >
      <pre className="mono-label m-0 text-[clamp(11px,1.4vw,14px)] leading-[1.9] text-grey">
        {boot.map(([name, status], i) => (
          <span key={name} className={`block transition-opacity duration-200 ${shown > i ? "opacity-100" : "opacity-0"}`}>
            &gt; {name.padEnd(12, ".")}... <b className="font-medium text-mark">{status}</b>
          </span>
        ))}
        <span className={`block tracking-[.2em] text-mark transition-opacity duration-200 ${shown > boot.length ? "opacity-100" : "opacity-0"}`}>
          <span className="inline-block animate-pulse">●</span> power on
        </span>
      </pre>
    </div>
  );
}
