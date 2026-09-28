import { method } from "@/content/site";
import { Section } from "@/components/Section";

export function Method() {
  return (
    <Section
      id="method"
      label="Method"
      tone="panel"
      heading={
        <>
          How a brief becomes <span className="hl-display">a system.</span>
        </>
      }
      intro="Four steps, in this order, every time. The order is the method."
    >
      <ol className="grid gap-px border-[1.5px] border-ink bg-ink sm:grid-cols-2">
        {method.map((m, i) => (
          <li key={m.title} className="flex flex-col gap-3 bg-panel p-6 sm:p-8">
            <span className="display text-[40px] leading-none text-ink">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-[19px] font-semibold leading-snug text-ink">{m.title}</h3>
            <p className="text-[15px] leading-relaxed text-grey">{m.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
