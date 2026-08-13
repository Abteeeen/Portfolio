"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { profile, socials } from "@/content/profile";

// The canvas touches window/WebGL, so it only ever renders on the client.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const words = profile.tagline.split(" ");

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pt-28 pb-20 sm:px-10"
    >
      {/* Aurora wash sitting behind the canvas. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute top-[-20%] left-[10%] h-[45rem] w-[45rem] rounded-full bg-accent/20 blur-[140px] animate-drift" />
        <div className="absolute right-[5%] bottom-[-25%] h-[38rem] w-[38rem] rounded-full bg-accent-2/12 blur-[130px] animate-drift [animation-delay:-6s]" />
      </div>

      {/* On wide screens the scene sits to the right of the copy; on narrow
          screens it stays centred and a scrim keeps the text legible. */}
      <div aria-hidden className="absolute inset-0 -z-10 opacity-85 lg:left-[28%]">
        <HeroCanvas />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] bg-bg/72 lg:bg-transparent lg:bg-gradient-to-r lg:from-bg lg:via-bg/75 lg:via-40% lg:to-transparent"
      />

      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-4 py-1.5 font-mono text-xs text-muted backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            {profile.available ? (
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-3 animate-pulse-ring" />
            ) : null}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                profile.available ? "bg-accent-3" : "bg-faint"
              }`}
            />
          </span>
          {profile.available ? "Open to opportunities" : "Currently unavailable"}
          <span className="text-faint">/</span>
          {profile.location}
        </motion.div>

        <h1 className="mt-8 max-w-4xl text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-7xl lg:text-8xl">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="mr-[0.25em] inline-block"
              initial={{ opacity: 0, y: reduced ? 0 : 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {i >= words.length - 2 ? (
                <span className="text-gradient">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          {profile.summary}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <a
            href="#work"
            className="group inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition hover:bg-accent-2"
          >
            View selected work
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-fg transition hover:border-accent hover:text-accent-2"
          >
            Get in touch
          </a>
          {profile.resumeUrl ? (
            <a
              href={profile.resumeUrl}
              className="inline-flex items-center gap-2 px-2 py-3 font-mono text-sm text-muted underline-offset-4 transition hover:text-fg hover:underline"
            >
              Résumé ↗
            </a>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-14 flex flex-wrap items-center gap-x-7 gap-y-2 font-mono text-xs text-faint"
        >
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noreferrer" : undefined}
              className="transition-colors hover:text-accent-2"
            >
              {social.label} — {social.handle}
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
