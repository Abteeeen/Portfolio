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
    image: "/proof/tender-radar-slack.jpg",
    imageSpec: "Phone · the Slack digest in #tenders · 1170 × 2532",
  },
  "eco-clean-whatsapp-leads": {
    phrase: "nobody calls",
    result: "Now they WhatsApp.",
    device: "phone",
    image: "/proof/eco-clean-whatsapp.jpg",
    imageSpec: "Phone · the WhatsApp thread · 1170 × 2532",
  },
  "codevantage-people": {
    phrase: "people data lives in five spreadsheets",
    result: "One dashboard, every week.",
    device: "laptop",
    image: "/proof/codevantage-people.jpg",
    imageSpec: "Laptop · the people dashboard · 1600 × 1000",
  },
  "fine-jewellery-direct": {
    phrase: "not look like every other Shopify store",
    result: "Fine jewellery, direct.",
    device: "tablet",
    image: "/proof/not-a-basic.jpg",
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
  kicker: "AI automation · People analytics · Growth marketing",
  line1: "Send the problem.",
  line2: "Get back a",
  word: "system.",
  sub: "I read the day's AI news, test what's new, and put the parts that work into systems for real businesses. Scroll through one day.",
  primary: "Write me a brief",
  secondary: "Casework",
};

/**
 * Screen 01, the Night desk film. The opening is `hero`; these are the four chapters the
 * camera moves through while the page is pinned, and the closing line.
 */
export const story = {
  chapters: [
    { n: "01", kicker: "Every day", title: "Something new ships.", line: "New models, nodes, APIs and launches, most mornings. I read them the day they land." },
    { n: "02", kicker: "Tested", title: "Most of it doesn't make the cut.", line: "Each update gets tried against a real client problem. The few that work are kept." },
    { n: "03", kicker: "Applied", title: "The keepers go to work.", line: "They get wired into client systems: tender alerts, WhatsApp leads, hiring, reporting." },
    { n: "04", kicker: "Proven", title: "Results, on record.", line: "A tender digest every morning. Leads on WhatsApp. A source for every enquiry." },
  ],
  close: "Tomorrow, the same loop",
};

export type NightUpdate = { time: string; src: string; t: string; keep: boolean; to?: number };

/**
 * What the scene shows on its cards and screens. Updates marked `keep` turn yellow and get
 * tied (`to`) to one of the problems; each problem gets its result pinned over it. Client
 * names follow the naming rules in site.ts.
 */
export const night: {
  updates: NightUpdate[];
  problems: { who: string; q: string; r: string }[];
  systems: { n: string; m: string; t: string }[];
} = {
  updates: [
    { time: "06:10", src: "LAUNCH", t: "Agent framework no. 41", keep: false },
    { time: "06:42", src: "N8N", t: "Agent node: new tools", keep: true, to: 0 },
    { time: "07:15", src: "THREAD", t: "500 prompts you need", keep: false },
    { time: "08:03", src: "TOOL", t: "AI logo generator v3", keep: false },
    { time: "09:20", src: "BETA", t: "Waitlist-only browser agent", keep: false },
    { time: "10:05", src: "CLAUDE", t: "New model, longer context", keep: true, to: 1 },
    { time: "12:30", src: "META ADS", t: "Click-to-WhatsApp update", keep: true, to: 2 },
    { time: "15:48", src: "APP", t: "Another AI chat app", keep: false },
    { time: "19:12", src: "GA4", t: "Attribution changes", keep: true, to: 3 },
  ],
  problems: [
    { who: "QLD CONTRACTOR", q: "We miss tenders.", r: "A tender digest in Slack every morning" },
    { who: "CODEVANTAGE", q: "People data lives in five spreadsheets.", r: "A scored shortlist and a weekly dashboard" },
    { who: "KERALA WORKSHOP", q: "Nobody calls.", r: "Leads now arrive as WhatsApp chats" },
    { who: "FIVE STAR ACADEMY", q: "Which ad worked?", r: "Every enquiry has a source" },
  ],
  systems: [
    { n: "Tender Radar", m: "3 new matches → Slack", t: "21:14" },
    { n: "Meta Ads agent", m: "Five Star cost per lead ↓ 12%", t: "21:09" },
    { n: "Resume ATS", m: "4 applicants scored, top fit 87", t: "21:02" },
    { n: "Blog agent", m: "draft published → Notion", t: "20:58" },
    { n: "End-of-day report", m: "posted to Slack, 6 tasks closed", t: "20:41" },
    { n: "Reel production", m: "concept → clip prompt", t: "19:30" },
  ],
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
