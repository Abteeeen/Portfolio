import Image from "next/image";
import { cases } from "@/content/site";
import { filmCases, filmOrder } from "@/content/film";
import { Appear } from "./Appear";
import { Device } from "./Device";
import { Highlight } from "./Highlight";
import { Kinetic } from "./Kinetic";

/** Five full-bleed screens: the client, one phrase from the brief, one line of result, one real screen. */
export function Casework() {
  return (
    <div id="casework">
      {filmOrder.map((slug, i) => {
        const c = cases.find((x) => x.slug === slug);
        const f = filmCases[slug];
        if (!c || !f) return null;
        const name = c.client.public ? c.client.name : c.client.anonymised;
        const num = String(i + 1).padStart(2, "0");
        return (
          <section key={slug} id={slug} className="screen gutter overflow-hidden">
            {f.image ? (
              <div className="absolute inset-0 z-0 opacity-25" aria-hidden="true">
                <Image src={f.image} alt="" fill sizes="100vw" className="scale-110 object-cover blur-3xl" />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_70%_60%,rgba(255,233,77,.10),transparent_55%)]" aria-hidden="true" />
            )}
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
              <div>
                <div className="mono-label text-mark">
                  {num} · {c.discipline}
                </div>
                <h2 className="display mt-4 text-[clamp(30px,5vw,84px)] text-ink">
                  <Kinetic as="span" text={name} stagger={0.03} />
                </h2>
                <p className="mt-6 font-display text-[clamp(20px,2.4vw,32px)] leading-[1.15] text-ink">
                  “<Highlight variant="fill">{f.phrase}</Highlight>”
                </p>
                <Appear as="p" delay={0.6} className="mt-5 text-[clamp(16px,1.6vw,22px)] text-grey">
                  {f.result}
                </Appear>
              </div>
              <Appear delay={0.3} className={`flex justify-center ${f.device === "phone" ? "lg:justify-center" : "lg:justify-end"}`}>
                <Device kind={f.device} src={f.image} alt={`${name}: ${f.imageSpec}`} spec={f.imageSpec} label={`Image ${num}`} />
              </Appear>
            </div>
          </section>
        );
      })}
    </div>
  );
}
