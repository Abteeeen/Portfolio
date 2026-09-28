import { cases } from "@/content/site";
import { BriefBlock } from "@/components/BriefBlock";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";

export function Casework() {
  return (
    <Section
      id="casework"
      label="Casework"
      heading={
        <>
          Every case starts with the brief, <span className="hl-display">in the client&rsquo;s words.</span>
        </>
      }
      intro="What they asked for, what was built, and what changed. Client names appear where the client has agreed; the rest are described by what they do."
    >
      <div className="flex flex-col gap-14 sm:gap-20">
        {cases.map((c) => {
          const name = c.client.public ? c.client.name : c.client.anonymised;
          return (
            <article key={c.slug} id={c.slug} className="scroll-mt-24 grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-10">
              <header className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
                <div className="label flex items-center gap-3 text-grey">
                  <span className="text-ink">Brief № {c.number}</span>
                  <span aria-hidden="true">·</span>
                  <span>{c.discipline}</span>
                </div>
                <h3 className="display text-[clamp(26px,3.2vw,38px)] text-ink">{name}</h3>
                <p className="label text-grey">
                  {c.place} · {c.status}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Stack">
                  {c.stack.map((s) => (
                    <li key={s} className="narrow border border-line px-2 py-0.5 text-[12px] text-grey">
                      {s}
                    </li>
                  ))}
                </ul>
              </header>

              <Reveal initial="visible" as="div">
                <BriefBlock brief={c.brief} marks={c.marks} wording={c.wording}>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <div className="label flex items-center gap-2 text-ink">
                        <span className="inline-block h-[1.5px] w-5 bg-ink" aria-hidden="true" />
                        Built
                      </div>
                      <ul className="mt-2 flex flex-col gap-1.5 text-[14.5px] leading-snug text-ink">
                        {c.built.map((b) => (
                          <li key={b} className="flex gap-2">
                            <span className="text-marker" aria-hidden="true">·</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="label flex items-center gap-2 text-ink">
                        <span className="inline-block h-[1.5px] w-5 bg-ink" aria-hidden="true" />
                        Result
                      </div>
                      <ul className="mt-2 flex flex-col gap-1.5 text-[14.5px] leading-snug text-ink">
                        {c.result.map((r) => (
                          <li key={r} className="flex gap-2">
                            <span className="text-marker" aria-hidden="true">·</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </BriefBlock>
              </Reveal>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
