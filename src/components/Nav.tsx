"use client";

import { useEffect, useState } from "react";
import { navItems, profile } from "@/content/profile";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null);

    // Bias the observation band toward the upper half so the highlighted link
    // matches the section the reader is actually looking at.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-accent transition-colors group-hover:bg-accent-2" />
          <span className="font-mono text-sm tracking-tight">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`rounded-full px-4 py-2 font-mono text-xs transition-colors ${
                  active === item.href
                    ? "bg-surface text-accent-2"
                    : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={`mailto:${profile.email}`}
          className="rounded-full border border-line px-4 py-2 font-mono text-xs text-fg transition hover:border-accent hover:text-accent-2"
        >
          Say hello
        </a>
      </nav>
    </header>
  );
}
