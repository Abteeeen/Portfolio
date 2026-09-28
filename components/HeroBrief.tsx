"use client";

import { useEffect, useState } from "react";
import type { CaseStudy } from "@/content/site";
import { BriefBlock } from "./BriefBlock";
import { Reveal } from "./Reveal";

export function HeroBrief({ items }: { items: CaseStudy[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 9000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const c = items[idx];
  const name = c.client.public ? c.client.name : c.client.anonymised;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2" role="tablist" aria-label="Example briefs">
        {items.map((it, i) => (
          <button
            key={it.slug}
            role="tab"
            type="button"
            aria-selected={i === idx}
            onClick={() => setIdx(i)}
            className={`label border-b-2 pb-1 transition-colors ${
              i === idx ? "border-mark text-ink" : "border-transparent text-grey hover:text-ink"
            }`}
          >
            {it.discipline}
          </button>
        ))}
      </div>

      <Reveal key={c.slug} initial="hidden">
        <BriefBlock
          brief={c.brief}
          marks={c.marks}
          wording={c.wording}
          header={
            <>
              <span className="label text-grey">
                <span className="text-ink">Brief № {c.number}</span> · {name}
              </span>
              <span className="label text-grey">
                {c.place} · {c.status}
              </span>
            </>
          }
        >
          <div className="mt-5">
            <div className="label flex items-center gap-2 text-ink">
              <span className="inline-block h-[1.5px] w-5 bg-ink" aria-hidden="true" />
              What shipped
            </div>
            <ul className="mt-2 grid gap-x-5 gap-y-1.5 text-[14px] leading-snug text-ink sm:grid-cols-2">
              {c.built.slice(0, 4).map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-marker" aria-hidden="true">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <a href={`#${c.slug}`} className="label mt-4 inline-block border-b-2 border-mark text-ink">
              Read the case
            </a>
          </div>
        </BriefBlock>
      </Reveal>
    </div>
  );
}
