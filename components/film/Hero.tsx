import { hero } from "@/content/film";
import { Appear } from "./Appear";
import { CanvasScene } from "./CanvasScene";
import { Highlight } from "./Highlight";
import { Kinetic } from "./Kinetic";

export function Hero() {
  return (
    <section id="top" className="screen gutter overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CanvasScene mode="hero" className="block h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_60%_45%,transparent_45%,rgba(0,0,0,.55)_100%)]" aria-hidden="true" />
      <div className="relative z-10 max-w-[64rem]">
        <h1 className="display text-[clamp(38px,7.6vw,116px)] uppercase leading-[.9] text-ink">
          <Kinetic as="span" className="block" text={hero.line1} trigger="on" />
          <span className="block">
            <Kinetic as="span" text={hero.line2} trigger="on" delay={0.5} />{" "}
            <Highlight trigger="on" delay={1.7}>
              <Kinetic as="span" text={hero.word} trigger="on" delay={0.8} />
            </Highlight>
          </span>
        </h1>
        <Appear as="p" trigger="on" delay={1.9} className="mt-6 max-w-[46ch] text-[clamp(15px,1.5vw,19px)] leading-relaxed text-grey">
          {hero.sub}
        </Appear>
        <Appear trigger="on" delay={2.2} className="mt-8 flex flex-wrap gap-3">
          <a href="#contact" className="label bg-mark px-5 py-3.5 text-mark-ink" data-hover>
            {hero.primary}
          </a>
          <a href="#casework" className="label border-[1.5px] border-ink px-5 py-3.5 text-ink" data-hover>
            {hero.secondary}
          </a>
        </Appear>
      </div>
    </section>
  );
}
