import { systems, toolkit } from "@/content/site";
import { Section } from "@/components/Section";

export function Toolkit() {
  return (
    <Section
      id="toolkit"
      label="Toolkit"
      tone="panel"
      heading={
        <>
          What I build with, and what is <span className="hl-display">already running.</span>
        </>
      }
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
        <dl className="rule">
          {toolkit.map((t) => (
            <div key={t.area} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[130px_1fr] sm:gap-6">
              <dt className="label pt-1 text-grey">{t.area}</dt>
              <dd>
                <div className="text-[15.5px] font-semibold text-ink">{t.tools}</div>
                <div className="mt-1 text-[14px] text-grey">{t.line}</div>
              </dd>
            </div>
          ))}
        </dl>
        <div>
          <div className="label mb-4 text-grey">Systems I run</div>
          <ul className="flex flex-col gap-3">
            {systems.map((s) => (
              <li key={s.name} className="flex gap-3 text-[15px] leading-snug">
                <span className="mt-[9px] inline-block h-[1.5px] w-4 shrink-0 bg-ink" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink">{s.name}</span>
                  <span className="text-grey"> · {s.line}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
