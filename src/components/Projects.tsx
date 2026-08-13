"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { projects, type Project } from "@/content/profile";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

const filters = ["All", "AI / ML", "People Analytics", "Automation", "Data"] as const;
type Filter = (typeof filters)[number];

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/50 ${
        project.featured ? "lg:col-span-3" : "lg:col-span-2"
      }`}
    >
      {/* Accent wash that fades in on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <span className="font-mono text-[0.7rem] tracking-widest text-accent-2 uppercase">
          {project.category}
        </span>
        {project.metric ? (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[0.7rem] text-accent-2">
            {project.metric}
          </span>
        ) : null}
      </div>

      <h3 className="relative mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
        {project.title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted">{project.blurb}</p>

      <div className="relative mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[0.7rem] text-faint"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="relative mt-6 flex items-center gap-4 border-t border-line pt-4">
        <button
          type="button"
          onClick={onOpen}
          className="font-mono text-xs text-fg transition-colors hover:text-accent-2"
        >
          Case study →
        </button>
        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-muted transition-colors hover:text-accent-2"
          >
            Code ↗
          </a>
        ) : null}
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-muted transition-colors hover:text-accent-2"
          >
            Live ↗
          </a>
        ) : null}
      </div>
    </motion.article>
  );
}

function CaseStudy({ project, onClose }: { project: Project; onClose: () => void }) {
  const rows = [
    { label: "Problem", value: project.problem },
    { label: "Approach", value: project.approach },
    { label: "Result", value: project.result },
  ];

  // Close on Escape, and hold the background still while the dialog is open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-bg/80 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface p-7 sm:p-9"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="font-mono text-[0.7rem] tracking-widest text-accent-2 uppercase">
              {project.category}
            </span>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {project.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close case study"
            className="shrink-0 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition hover:border-accent hover:text-fg"
          >
            Esc
          </button>
        </div>

        <dl className="mt-8 space-y-6">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="font-mono text-[0.7rem] tracking-widest text-faint uppercase">
                {row.label}
              </dt>
              <dd className="mt-2 leading-relaxed text-muted">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap gap-1.5 border-t border-line pt-6">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[0.7rem] text-faint"
            >
              {tech}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<Project | null>(null);
  const reduced = useReducedMotion();

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  // Only offer filters that actually match something.
  const availableFilters = useMemo(
    () => filters.filter((f) => f === "All" || projects.some((p) => p.category === f)),
    [],
  );

  return (
    <section id="work" className="scroll-mt-24 px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="01"
          title="Selected work"
          lead="Models, pipelines, and the interfaces that make them usable. Open any card for the problem, the approach, and what actually came out of it."
        />

        <Reveal delay={0.1} className="mt-10 flex flex-wrap gap-2">
          {availableFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-4 py-2 font-mono text-xs transition ${
                filter === item
                  ? "border-accent bg-accent/10 text-accent-2"
                  : "border-line text-muted hover:border-faint hover:text-fg"
              }`}
            >
              {item}
            </button>
          ))}
        </Reveal>

        <motion.div layout={!reduced} className="mt-10 grid gap-4 lg:grid-cols-6">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <ProjectCard
                key={project.title}
                project={project}
                onOpen={() => setOpen(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {open ? <CaseStudy project={open} onClose={() => setOpen(null)} /> : null}
      </AnimatePresence>
    </section>
  );
}
