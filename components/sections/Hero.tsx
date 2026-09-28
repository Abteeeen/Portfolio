import { cases, person } from "@/content/site";
import { HeroBrief } from "@/components/HeroBrief";

export function Hero() {
  const heroCases = cases.filter((c) => c.hero);
  return (
    <section id="top" className="bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="flex flex-col justify-center">
          <h1 className="display max-w-[12ch] text-[clamp(44px,8.6vw,96px)] text-ink">
            Send the problem. Get back a&nbsp;<span className="hl-display">system.</span>
          </h1>
          <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-grey sm:text-[18px]">{person.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="label bg-ink px-5 py-3.5 text-paper">
              Write me a brief
            </a>
            <a href="#casework" className="label border-[1.5px] border-ink px-5 py-3.5 text-ink hover:bg-panel">
              Casework
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14px]">
            <dt className="label pt-0.5 text-grey">Now</dt>
            <dd className="text-ink">
              Co-founder, <a href={person.studio.url} className="border-b-2 border-mark" target="_blank" rel="noreferrer">CJ Studios</a>. HR analyst and automation specialist, Codevantage.
            </dd>
            <dt className="label pt-0.5 text-grey">Based</dt>
            <dd className="text-ink">{person.location}</dd>
          </dl>
        </div>
        <div className="lg:pt-2">
          <HeroBrief items={heroCases} />
        </div>
      </div>
    </section>
  );
}
