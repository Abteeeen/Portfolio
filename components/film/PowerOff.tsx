import { ending } from "@/content/film";
import { person } from "@/content/site";
import { BriefForm } from "@/components/BriefForm";
import { CopyEmail } from "@/components/CopyEmail";
import { Appear } from "./Appear";
import { Kinetic } from "./Kinetic";

/** The ending: one line, the ring button, the brief form, the footer marquee. */
export function PowerOff() {
  const year = new Date().getFullYear();
  const ring = `${ending.cta.toUpperCase()} · `;
  return (
    <>
      <section id="contact" className="screen gutter">
        <div className="max-w-[64rem]">
          <h2 className="display text-[clamp(34px,6vw,96px)] text-ink">
            <Kinetic as="span" text={ending.line} />
          </h2>
          <Appear delay={0.4} className="mt-10">
            <a href="#brief" className="relative inline-flex h-[168px] w-[168px] items-center justify-center rounded-full" data-hover aria-label={ending.cta}>
              <svg viewBox="0 0 100 100" className="spin-ring absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <path id="ring-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text className="fill-mark" style={{ fontSize: "8.6px", letterSpacing: ".16em", fontFamily: "var(--font-mono)" }}>
                  <textPath href="#ring-path">{ring + ring}</textPath>
                </text>
              </svg>
              <span className="text-2xl text-mark" aria-hidden="true">
                ↓
              </span>
            </a>
          </Appear>
        </div>

        <div id="brief" className="mt-20 grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
          <BriefForm />
          <aside className="flex flex-col gap-8">
            <div>
              <div className="mono-label mb-3 text-grey">Or just email</div>
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
      </section>

      <footer className="border-t border-line py-8">
        <div className="marquee display text-[clamp(40px,8vw,120px)] uppercase leading-none text-dim" aria-hidden="true">
          <div>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="pr-[.5em]">
                {ending.marquee} ·
              </span>
            ))}
          </div>
        </div>
        <div className="gutter mono-label mt-8 flex flex-wrap justify-between gap-3 pb-10 text-grey">
          <span>
            © {year} {person.name}
          </span>
          <span>No tracking scripts. Nothing you type here is stored.</span>
          <a href="#top" className="text-ink">
            Top
          </a>
        </div>
      </footer>
    </>
  );
}
