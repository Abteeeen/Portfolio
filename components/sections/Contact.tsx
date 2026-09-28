import { person } from "@/content/site";
import { BriefForm } from "@/components/BriefForm";
import { CopyEmail } from "@/components/CopyEmail";
import { Section } from "@/components/Section";

export function Contact() {
  return (
    <Section
      id="contact"
      label="Contact"
      tone="panel"
      heading={
        <>
          Write me <span className="hl-display">a brief.</span>
        </>
      }
      intro="One line about the problem is enough. You get how I would start and the two closest cases, then we talk."
    >
      <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-14">
        <BriefForm />
        <aside className="flex flex-col gap-8">
          <div>
            <div className="label mb-3 text-grey">Or just email</div>
            <CopyEmail email={person.email} />
            <p className="mt-2 text-[13.5px] text-grey">{person.replyTime}</p>
          </div>
          <ul className="flex flex-col gap-2 text-[15px]">
            <li>
              <a href={person.linkedin} target="_blank" rel="noreferrer" className="border-b-2 border-mark text-ink">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={person.github} target="_blank" rel="noreferrer" className="border-b-2 border-mark text-ink">
                GitHub
              </a>
            </li>
            <li>
              <a href={person.studio.url} target="_blank" rel="noreferrer" className="border-b-2 border-mark text-ink">
                CJ Studios
              </a>
            </li>
            <li>
              <a href={person.resume} className="border-b-2 border-mark text-ink">
                Resume (PDF)
              </a>
            </li>
          </ul>
          <p className="text-[13.5px] leading-relaxed text-grey">{person.location}</p>
        </aside>
      </div>
    </Section>
  );
}
