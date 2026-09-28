import Image from "next/image";
import { founder } from "@/content/film";
import { person } from "@/content/site";
import { Appear } from "./Appear";
import { FounderReel } from "./FounderReel";

/** A yellow band torn across the black, with the founder line and a CJ Studios clip or still. */
export function Founder() {
  return (
    <section id="founder" className="screen gutter">
      <Appear band className="torn -mx-[clamp(20px,5vw,72px)] bg-mark px-[clamp(20px,5vw,72px)] py-[clamp(56px,9vw,120px)]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="label text-[#5b5620]">
              Founder ·{" "}
              <a href={person.studio.url} target="_blank" rel="noreferrer" className="underline decoration-2 underline-offset-4">
                CJ Studios
              </a>
            </div>
            <p className="display mt-5 text-[clamp(28px,4.2vw,64px)] text-mark-ink">{founder.line}</p>
          </div>
          <figure className="m-0">
            <div className="relative mx-auto aspect-video w-full max-w-[560px] overflow-hidden rounded-[6px] bg-[#1a1a10] shadow-[0_24px_60px_rgba(60,50,0,.35)]">
              {founder.image ? (
                <Image src={founder.image} alt={`${person.studio.name}: ${founder.caption}`} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
              ) : (
                <FounderReel src={founder.video} poster={founder.poster} label={`${person.studio.name}: ${founder.caption}`} />
              )}
            </div>
            <figcaption className="label mx-auto mt-3 max-w-[560px] text-[#5b5620]">
              {founder.caption} ·{" "}
              <a href={person.studio.url} target="_blank" rel="noreferrer" className="underline decoration-2 underline-offset-4">
                cjstudios.tech
              </a>
            </figcaption>
          </figure>
        </div>
      </Appear>
    </section>
  );
}
