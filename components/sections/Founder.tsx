import { certifications, education, founder, person, research, roles } from "@/content/site";
import { Section } from "@/components/Section";

export function Founder() {
  return (
    <Section
      id="founder"
      label="Founder"
      heading={founder.heading}
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-10">
        <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-ink">
          {founder.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <a href={person.studio.url} target="_blank" rel="noreferrer" className="label w-fit border-b-2 border-mark text-ink">
            cjstudios.tech
          </a>
        </div>

        <div className="flex flex-col gap-12">
          <div>
            <div className="label mb-4 text-grey">Roles</div>
            <ol className="rule">
              {roles.map((r) => (
                <li key={r.title + r.org} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <span className="label pt-1 text-grey">{r.period}</span>
                  <div>
                    <div className="text-[17px] font-semibold text-ink">
                      {r.title}, {r.org}
                    </div>
                    <div className="label mt-1 text-grey">{r.place}</div>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-grey">{r.note}</p>
                  </div>
                </li>
              ))}
              {education.map((e) => (
                <li key={e.title} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <span className="label pt-1 text-grey">{e.period}</span>
                  <div>
                    <div className="text-[17px] font-semibold text-ink">{e.title}</div>
                    <div className="label mt-1 text-grey">
                      {e.org} · {e.place}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="label mb-4 text-grey">Research</div>
            <ul className="grid gap-px border-[1.5px] border-ink bg-ink sm:grid-cols-2">
              {research.map((r) => (
                <li key={r.title} className="flex flex-col gap-2 bg-paper p-5 sm:last:col-span-2">
                  <h3 className="text-[15px] font-semibold leading-snug text-ink">{r.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-grey">{r.body}</p>
                  {"link" in r && r.link ? (
                    <a href={r.link} target="_blank" rel="noreferrer" className="label w-fit border-b-2 border-mark text-ink">
                      Read on ResearchGate
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="label mb-3 text-grey">Certifications</div>
            <ul className="flex flex-col gap-1 text-[14.5px] text-ink">
              {certifications.map((c) => (
                <li key={c.title} className="flex flex-wrap gap-x-2">
                  <span>{c.title}</span>
                  <span className="text-grey">· {c.org}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
