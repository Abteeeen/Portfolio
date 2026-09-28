"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={`mailto:${email}`} className="display text-[clamp(22px,3vw,30px)] text-ink">
        <span className="hl-display">{email}</span>
      </a>
      <button type="button" onClick={copy} className="label border-[1.5px] border-ink px-3 py-2 text-ink hover:bg-panel">
        {state === "copied" ? "Copied" : state === "failed" ? "Select and copy" : "Copy"}
      </button>
    </div>
  );
}
