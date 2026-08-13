import { profile, socials } from "@/content/profile";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-24 overflow-hidden border-t border-line px-6 py-28 sm:px-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-40%] left-1/2 h-[35rem] w-[35rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[130px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          index="04"
          title="Let's build something"
          lead="Open to roles and collaborations in data science, people analytics, and automation. The fastest way to reach me is email."
        />

        <Reveal delay={0.1}>
          <a
            href={`mailto:${profile.email}`}
            className="group mt-12 inline-flex flex-wrap items-baseline gap-x-4 text-3xl font-semibold tracking-tight break-all transition-colors hover:text-accent-2 sm:text-5xl"
          >
            {profile.email}
            <span
              aria-hidden
              className="text-2xl transition-transform group-hover:translate-x-1"
            >
              ↗
            </span>
          </a>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-14 grid gap-3 sm:grid-cols-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-widest text-faint uppercase">
                    {social.label}
                  </span>
                  <span
                    aria-hidden
                    className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-2"
                  >
                    →
                  </span>
                </div>
                <div className="mt-3 truncate text-sm text-fg">{social.handle}</div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
