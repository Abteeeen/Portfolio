"use client";

import { motion } from "motion/react";
import { skills } from "@/content/profile";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-24 border-t border-line px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="02"
          title="What I work with"
          lead="Depth where it matters — modelling and automation — with enough engineering to ship the result rather than hand off a notebook."
        />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill, i) => (
            <Reveal key={skill.name} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/50">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-medium tracking-tight">{skill.name}</h3>
                  <span className="font-mono text-xs text-accent-2 tabular-nums">
                    {skill.level}
                  </span>
                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                <p className="mt-4 text-xs leading-relaxed text-faint">{skill.note}</p>
                <span className="mt-4 inline-block font-mono text-[0.65rem] tracking-widest text-faint uppercase">
                  {skill.group}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
