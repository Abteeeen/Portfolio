import type { ReactNode } from "react";

export function Section({
  id,
  label,
  heading,
  intro,
  children,
  tone = "paper",
}: {
  id: string;
  label: string;
  heading: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  tone?: "paper" | "panel";
}) {
  return (
    <section id={id} className={`scroll-mt-20 ${tone === "panel" ? "bg-panel" : "bg-paper"}`}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-10 grid gap-4 sm:mb-14 lg:grid-cols-[1fr_2fr] lg:gap-10">
          <div className="label text-grey">{label}</div>
          <div className="flex flex-col gap-4">
            <h2 className="display text-[clamp(30px,4.4vw,52px)] text-ink">{heading}</h2>
            {intro ? <p className="max-w-[60ch] text-[17px] leading-relaxed text-grey">{intro}</p> : null}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
