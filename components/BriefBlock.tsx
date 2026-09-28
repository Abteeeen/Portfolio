"use client";

import { useId, useState, type ReactNode } from "react";
import { parseBrief } from "@/lib/brief";

/**
 * The marked-up brief: a client's problem with the decisive phrases highlighted.
 * Tap a highlighted phrase to read the decision behind it.
 */
export function BriefBlock({
  brief,
  marks,
  header,
  footer,
  wording,
  children,
}: {
  brief: string;
  marks: Record<string, string>;
  header?: ReactNode;
  footer?: ReactNode;
  wording: "client" | "paraphrased";
  children?: ReactNode;
}) {
  const [active, setActive] = useState<string | null>(null);
  const noteId = useId();
  const segments = parseBrief(brief);

  return (
    <div className="border-[1.5px] border-ink bg-paper p-5 sm:p-6">
      {header ? <div className="mb-4 flex flex-wrap justify-between gap-x-4 gap-y-1">{header}</div> : null}

      <p className="text-[17px] leading-[1.55] text-ink sm:text-[18px]">
        <span aria-hidden="true">“</span>
        {segments.map((s, i) => {
          if (!s.mark) return <span key={i}>{s.text}</span>;
          const note = marks[s.text];
          if (!note) {
            return (
              <mark key={i} className="hl">
                {s.text}
              </mark>
            );
          }
          const isOpen = active === s.text;
          const toggle = () => setActive(isOpen ? null : s.text);
          return (
            <mark
              key={i}
              role="button"
              tabIndex={0}
              className="hl hl-btn"
              aria-expanded={isOpen}
              aria-controls={noteId}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
              title="Why this mattered"
            >
              {s.text}
            </mark>
          );
        })}
        <span aria-hidden="true">”</span>
      </p>

      <div id={noteId} aria-live="polite" className={active ? "mt-4" : "hidden"}>
        {active ? (
          <div className="flex gap-3 border-l-[3px] border-mark pl-3 text-[14px] leading-relaxed text-ink">
            <p>
              <span className="label mr-2 text-grey">Why</span>
              {marks[active]}
            </p>
          </div>
        ) : null}
      </div>

      {Object.keys(marks).length > 0 && !active ? (
        <p className="label mt-3 text-grey">Tap a highlight for the decision behind it</p>
      ) : null}

      {children}

      {wording === "paraphrased" || footer ? (
        <div className="mt-4 border-t border-dashed border-line pt-3 text-[12.5px] leading-relaxed text-grey">
          {footer}
          {wording === "paraphrased" ? <span>{footer ? " " : ""}Brief paraphrased from the client&rsquo;s own words.</span> : null}
        </div>
      ) : null}
    </div>
  );
}
