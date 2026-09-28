/**
 * Copy and structure for the film version of the site. Every word on the
 * page that is not in site.ts lives here. Keep it short: the whole page is
 * about 220 words.
 */
import { cases } from "./site";

export type Device = "laptop" | "phone" | "tablet";

export type FilmCase = {
  /** The phrase from the brief that gets the highlighter. */
  phrase: string;
  /** One line of result. */
  result: string;
  device: Device;
  /** Path under /public. Leave undefined to show a marked placeholder. */
  image?: string;
  /** What the image should be, shown on the placeholder. */
  imageSpec: string;
};

/** Order of the five casework screens. */
export const filmOrder = [
  "five-star-training-academy",
  "tender-radar",
  "eco-clean-whatsapp-leads",
  "codevantage-people",
  "fine-jewellery-direct",
] as const;

export const filmCases: Record<string, FilmCase> = {
  "five-star-training-academy": {
    phrase: "can't tell which ads the enquiries came from",
    result: "Every enquiry has a source now.",
    device: "laptop",
    image: "/proof/five-star-home.jpg",
    imageSpec: "Laptop · the live site · 1600 × 1000",
  },
  "tender-radar": {
    phrase: "We miss tenders",
    result: "A digest every morning, sorted by closing date.",
    device: "phone",
    imageSpec: "Phone · the Slack digest in #tenders · 1170 × 2532",
  },
  "eco-clean-whatsapp-leads": {
    phrase: "nobody calls",
    result: "Now they WhatsApp.",
    device: "phone",
    imageSpec: "Phone · the WhatsApp thread · 1170 × 2532",
  },
  "codevantage-people": {
    phrase: "people data lives in five spreadsheets",
    result: "One dashboard, every week.",
    device: "laptop",
    imageSpec: "Laptop · the people dashboard · 1600 × 1000",
  },
  "fine-jewellery-direct": {
    phrase: "not look like every other Shopify store",
    result: "Fine jewellery, direct.",
    device: "tablet",
    imageSpec: "Tablet · the homepage · 1600 × 1200",
  },
};

export const boot: [string, string][] = [
  ["n8n", "online"],
  ["hubspot", "connected"],
  ["meta ads", "connected"],
  ["ga4 · gtm", "firing"],
  ["claude", "ready"],
];

export const hero = {
  line1: "Send the problem.",
  line2: "Get back a",
  word: "system.",
  sub: "AI automation, people analytics, growth marketing. Co-founder of CJ Studios. Everything on this page is running right now.",
  primary: "Write me a brief",
  secondary: "Casework",
};

/** Screen 02. Change these to your own numbers; each carries its source. */
export const running = [
  { value: 43, label: "pages rebuilt", source: "Five Star Training Academy, one shared layout system, 2026" },
  { value: 6, label: "systems running", source: "Tender Radar, Resume ATS, Meta Ads agent, Blog agent, EOD report, Reel production" },
  { value: 4, label: "clients served", source: "A training academy, a Queensland contractor, a Kerala workshop, a jewellery label" },
];

export const system = {
  line: "Everything above runs on this.",
  hint: "Move across the graph. Each node belongs to a case.",
};

export const founder = {
  line: "I co-founded CJ Studios so small businesses could afford production that used to need a crew.",
  photo: undefined as string | undefined,
  photoSpec: "Portrait · plain background · 2000 × 2500",
};

export const method = [
  { word: "Read.", line: "Once for what you asked, once for what it is costing you." },
  { word: "Measure.", line: "Tags, pipelines, a baseline. If we cannot see it, we cannot claim we improved it." },
  { word: "Build.", line: "The smallest system that runs without me. n8n where it fits, code where it does not." },
  { word: "Report.", line: "A weekly page you can read in two minutes." },
];

export const ending = {
  line: "Everything on this page is still running.",
  cta: "Write me a brief",
  marquee: "Built to run without me",
};

/** Bottom ticker. In production, replace with a sanitised n8n log endpoint. */
export const ticker = [
  { t: "21:14:02", n: "tender-radar", m: "3 new matches → Slack" },
  { t: "21:09:47", n: "meta-ads-agent", m: "Five Star cost per lead ↓ 12%" },
  { t: "21:02:11", n: "resume-ats", m: "4 applicants scored, top fit 87" },
  { t: "20:58:30", n: "blog-agent", m: "draft published → Notion" },
  { t: "20:41:05", n: "eod-report", m: "posted to Slack, 6 tasks closed" },
];

/** Cards in the canvas. `slug` links a card to the case that uses it. */
export const nodes: { name: string; sub: string; slug?: string }[] = [
  { name: "Webhook", sub: "new enquiry", slug: "five-star-training-academy" },
  { name: "HubSpot", sub: "create contact", slug: "five-star-training-academy" },
  { name: "GA4", sub: "event", slug: "five-star-training-academy" },
  { name: "Schedule", sub: "06:00", slug: "tender-radar" },
  { name: "Tender Radar", sub: "score notices", slug: "tender-radar" },
  { name: "Slack", sub: "post digest", slug: "tender-radar" },
  { name: "Meta", sub: "fetch spend", slug: "eco-clean-whatsapp-leads" },
  { name: "WhatsApp", sub: "reply", slug: "eco-clean-whatsapp-leads" },
  { name: "Resume", sub: "extract PDF", slug: "codevantage-people" },
  { name: "Claude", sub: "score fit", slug: "codevantage-people" },
  { name: "IF", sub: "fit > 75", slug: "codevantage-people" },
  { name: "Google Sheets", sub: "log row", slug: "codevantage-people" },
  { name: "Shopify", sub: "order", slug: "fine-jewellery-direct" },
  { name: "Notion", sub: "publish draft", slug: "cj-studios-production-system" },
  { name: "Seedance", sub: "render reel", slug: "cj-studios-production-system" },
  { name: "EOD", sub: "report", slug: "cj-studios-production-system" },
];

export function caseTitle(slug: string): string {
  const c = cases.find((x) => x.slug === slug);
  if (!c) return "";
  return c.client.public ? c.client.name : c.client.anonymised;
}
