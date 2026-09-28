import week from "@/content/week.json";
import { Section } from "@/components/Section";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function Ledger() {
  return (
    <Section
      id="ledger"
      label={`${week.heading} · updated ${formatDate(week.updated)}`}
      heading={
        <>
          Proof the site is <span className="hl-display">alive.</span>
        </>
      }
      intro="A short ledger of what went out recently. It is written from real work, not a blog I have to keep up."
    >
      <ol className="rule max-w-3xl">
        {week.lines.map((l) => (
          <li key={l.text} className="grid gap-1 border-b border-line py-3.5 sm:grid-cols-[90px_1fr] sm:gap-6">
            <span className="label tabular pt-1 text-grey">{l.date}</span>
            <span className="text-[15.5px] leading-relaxed text-ink">{l.text}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
