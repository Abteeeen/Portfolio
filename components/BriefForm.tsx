"use client";

import { useState } from "react";
import { person } from "@/content/site";
import type { BriefAnswer, Mode } from "@/lib/match";

export function BriefForm() {
  const [mode, setMode] = useState<Mode>("brief");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<BriefAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      const r = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Something went wrong.");
      setAnswer(data as BriefAnswer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const subject = mode === "role" ? "A role for Abhiram" : "A brief for Abhiram";
  const mailto = `mailto:${person.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" aria-describedby="brief-help">
      <div className="flex flex-wrap gap-2" role="group" aria-label="What is this about">
        {(
          [
            ["brief", "I have a problem"],
            ["role", "I am hiring"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`label border-[1.5px] px-3 py-2 transition-colors ${
              mode === m ? "border-ink bg-ink text-paper" : "border-ink text-ink hover:bg-panel"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-2">
        <span className="label text-grey">
          {mode === "role" ? "Paste the role, or describe the team" : "One line is enough. What is the problem?"}
        </span>
        <textarea
          id="brief-text"
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          minLength={8}
          maxLength={1500}
          required
          placeholder={
            mode === "role"
              ? "HR analyst who can automate reporting and screening, hybrid, starts November."
              : "We run ads but cannot tell which ones bring the enquiries."
          }
          className="w-full resize-y border-[1.5px] border-ink bg-paper p-4 text-[16px] leading-relaxed text-ink placeholder:text-grey/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-mark"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || text.trim().length < 8}
          className="label bg-ink px-5 py-3 text-paper transition-opacity disabled:opacity-40"
        >
          {busy ? "Reading it" : mode === "role" ? "See where I fit" : "See how I would start"}
        </button>
        <span id="brief-help" className="text-[13px] text-grey">
          {person.replyTime} Nothing you type is stored.
        </span>
      </div>

      {error ? (
        <p role="alert" className="border-l-[3px] border-marker pl-3 text-[14px] text-ink">
          {error} You can still send it straight to{" "}
          <a className="border-b-2 border-mark" href={mailto}>
            {person.email}
          </a>
          .
        </p>
      ) : null}

      {answer ? (
        <div className="border-[1.5px] border-ink p-5" aria-live="polite">
          <div className="label flex items-center gap-2 text-ink">
            <span className="inline-block h-[1.5px] w-5 bg-ink" aria-hidden="true" />
            {mode === "role" ? "Where I fit" : "How I would start"}
          </div>
          <p className="mt-3 text-[16px] leading-relaxed text-ink">{answer.approach}</p>
          <div className="label mt-5 text-grey">Relevant casework</div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {answer.cases.map((c) => (
              <li key={c.slug}>
                <a href={`#${c.slug}`} className="border-b-2 border-mark text-[15px] text-ink">
                  {c.title}
                </a>
                <span className="label ml-2 text-grey">{c.discipline}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href={mailto} className="label border-[1.5px] border-ink px-4 py-2.5 text-ink hover:bg-panel">
              Send this to me
            </a>
            <span className="text-[13px] text-grey">
              {answer.source === "n8n" ? "Answered by my agent." : "Matched against the casework on this page."}
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
