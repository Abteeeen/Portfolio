import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  index: string;
  title: string;
  lead?: ReactNode;
};

export function SectionHeading({ index, title, lead }: SectionHeadingProps) {
  return (
    <Reveal className="max-w-2xl">
      <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-accent-2 uppercase">
        <span>{index}</span>
        <span className="h-px w-10 bg-line" />
      </div>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {lead ? <p className="mt-4 text-base leading-relaxed text-muted">{lead}</p> : null}
    </Reveal>
  );
}
