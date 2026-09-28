import Image from "next/image";
import { founder } from "@/content/film";
import { person } from "@/content/site";
import { Appear } from "./Appear";

/** A yellow band torn across the black, with the founder line and a duotone portrait. */
export function Founder() {
  return (
    <section id="founder" className="screen gutter">
      <Appear band className="torn -mx-[clamp(20px,5vw,72px)] bg-mark px-[clamp(20px,5vw,72px)] py-[clamp(56px,9vw,120px)]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="label text-[#5b5620]">
              Founder ·{" "}
              <a href={person.studio.url} target="_blank" rel="noreferrer" className="underline decoration-2 underline-offset-4">
                CJ Studios
              </a>
            </div>
            <p className="display mt-5 text-[clamp(28px,4.2vw,64px)] text-mark-ink">{founder.line}</p>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-[6px] bg-[#1a1a10]">
            {founder.photo ? (
              <Image src={founder.photo} alt={person.name} fill sizes="340px" className="duotone object-cover" />
            ) : (
              <div className="placeholder" role="img" aria-label={`Placeholder: ${founder.photoSpec}`}>
                <b>Image 06</b>
                <span>{founder.photoSpec}</span>
              </div>
            )}
          </div>
        </div>
      </Appear>
    </section>
  );
}
