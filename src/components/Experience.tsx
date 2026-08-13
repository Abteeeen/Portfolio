import { certifications, experience } from "@/content/profile";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

export function Experience() {
  return (
    <section id="path" className="scroll-mt-24 border-t border-line px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="03"
          title="The path so far"
          lead="From supply chain analytics into people analytics — the same question each time: where is the signal hiding, and what changes once someone can see it?"
        />

        <div className="mt-14 grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <ol className="relative space-y-10 border-l border-line pl-8">
            {experience.map((item, i) => (
              <li key={`${item.role}-${item.org}`} className="relative">
                {/* Node marker sitting on the timeline rule. */}
                <span
                  aria-hidden
                  className={`absolute top-1.5 -left-[2.15rem] h-3 w-3 rounded-full border-2 ${
                    item.current
                      ? "border-accent-3 bg-accent-3"
                      : "border-line bg-bg"
                  }`}
                />

                <Reveal delay={i * 0.08}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-accent-2">{item.period}</span>
                    {item.current ? (
                      <span className="rounded-full border border-accent-3/30 bg-accent-3/10 px-2 py-0.5 font-mono text-[0.65rem] text-accent-3">
                        Current
                      </span>
                    ) : null}
                    {item.kind === "education" ? (
                      <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.65rem] text-faint">
                        Education
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-2 text-xl font-semibold tracking-tight">{item.role}</h3>
                  <p className="mt-0.5 text-sm text-muted">{item.org}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.summary}</p>

                  <ul className="mt-4 space-y-2">
                    {item.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex gap-3 text-sm leading-relaxed text-faint"
                      >
                        <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-line" />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-[0.7rem] text-faint"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <div>
            <Reveal>
              <h3 className="font-mono text-xs tracking-widest text-faint uppercase">
                Certifications
              </h3>
            </Reveal>

            <div className="mt-6 space-y-3">
              {certifications.map((cert, i) => (
                <Reveal key={cert.name} delay={i * 0.08}>
                  <div className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{cert.name}</span>
                      <span className="font-mono text-xs text-faint">{cert.year}</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-accent-2">{cert.issuer}</div>
                    {cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block font-mono text-xs text-muted transition-colors hover:text-accent-2"
                      >
                        Verify ↗
                      </a>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
