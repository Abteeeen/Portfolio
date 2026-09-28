/**
 * All site copy lives here. Edit this file to change what the site says.
 *
 * Client naming: each case study has `client.public`. When false, the site shows
 * `client.anonymised` instead of `client.name`. Flip it to true once the client
 * has agreed to be named.
 *
 * Briefs use [[double brackets]] around the phrases to highlight. Each highlighted
 * phrase can carry a note in `marks` (the marginalia shown when a reader taps it).
 */

export type Discipline = "Marketing" | "Automation" | "People" | "Studio";

export type CaseStudy = {
  slug: string;
  number: string;
  discipline: Discipline;
  client: { name: string; anonymised: string; public: boolean };
  place: string;
  status: string;
  /** Marked-up brief. Wording is paraphrased unless `wording` is "client". */
  brief: string;
  wording: "client" | "paraphrased";
  marks: Record<string, string>;
  built: string[];
  result: string[];
  stack: string[];
  keywords: string[];
  hero?: boolean;
};

export const person = {
  name: "Abhiram Anil",
  shortName: "Abhiram",
  title: "AI automation engineer, HR analyst and growth marketer. Co-founder of CJ Studios.",
  tagline: "Send the problem. Get back a system.",
  intro:
    "Abhiram Anil, co-founder of CJ Studios. AI automation, HR analytics and growth marketing for businesses that want the work to keep running after the meeting ends.",
  location: "Kerala, India · working with clients in Australia",
  email: "abhiramaanil@gmail.com",
  linkedin: "https://www.linkedin.com/in/abhiram-anil-092946223/",
  github: "https://github.com/Abteeeen",
  studio: { name: "CJ Studios", url: "https://www.cjstudios.tech/" },
  resume: "/Abhiram-Anil-Resume.pdf",
  replyTime: "I reply within one working day.",
};

export const nav = [
  { href: "#casework", label: "Casework" },
  { href: "#method", label: "Method" },
  { href: "#founder", label: "Founder" },
  { href: "#contact", label: "Contact" },
];

export const cases: CaseStudy[] = [
  {
    slug: "five-star-training-academy",
    number: "07",
    discipline: "Marketing",
    client: {
      name: "Five Star Training Academy",
      anonymised: "A registered training organisation, Brisbane",
      public: true,
    },
    place: "Brisbane",
    status: "Ongoing",
    brief:
      "We get enquiries but [[can't tell which ads or pages they came from]]. The site is slow, the [[course pages don't convert]], and [[HubSpot is a mess]].",
    wording: "paraphrased",
    marks: {
      "can't tell which ads or pages they came from":
        "Every enquiry needed a source. I rebuilt the tag layer in Google Tag Manager: GA4 events, the Meta pixel with enhanced conversions, and a container audit that retired the dead tags.",
      "course pages don't convert":
        "The course template was rebuilt around one question: can you enrol from any screen without scrolling back? Sticky enrol, dates, funding codes, and zero layout shift at phone width.",
      "HubSpot is a mess":
        "I traced the enquiry-to-sale path through the HubSpot pipelines and follow-up rules, then closed the gaps where leads sat untouched.",
    },
    built: [
      "43-page site rebuild on one shared layout system",
      "GTM container rebuilt: GA4 events, Meta pixel, enhanced conversions",
      "HubSpot pipeline audit and follow-up rules",
      "Course and location page templates, including eleven location pages",
      "Ongoing Meta and Google Ads analysis and reporting",
    ],
    result: [
      "One measurable source for every enquiry",
      "10 KB of CSS removed from every route",
      "Zero layout shift on course pages at phone width",
      "44 routes checked for overflow on every deploy",
    ],
    stack: ["WordPress", "Google Tag Manager", "GA4", "Meta Ads", "HubSpot", "Claude Code"],
    keywords: [
      "ads", "meta", "google ads", "tracking", "analytics", "ga4", "gtm", "tag manager", "hubspot", "crm",
      "website", "site", "seo", "leads", "enquir", "conversion", "landing", "training", "rto", "course",
      "pixel", "funnel", "slow", "speed", "pipeline", "marketing",
    ],
    hero: true,
  },
  {
    slug: "tender-radar",
    number: "06",
    discipline: "Automation",
    client: {
      name: "Chief Group Services",
      anonymised: "A security and cleaning contractor, South-East Queensland",
      public: false,
    },
    place: "Queensland",
    status: "Delivered 2026",
    brief:
      "[[We miss tenders]] because nobody has time to check AusTender and six council portals every morning. By the time we see one, [[the deadline is a week away]].",
    wording: "paraphrased",
    marks: {
      "We miss tenders":
        "The source register came first: every portal mapped with its feed, its cadence and what counts as a match. An n8n workflow polls them, scores each notice against the company's categories and posts a daily digest.",
      "the deadline is a week away":
        "Closing dates drive the sort order. Anything inside ten days sits at the top of the digest with the documents attached.",
    },
    built: [
      "Source register covering AusTender, QTenders and council portals",
      "n8n workflow: RSS ingestion, de-duplication, keyword scoring",
      "Daily Slack digest sorted by closing date",
      "Proposal deck for the leadership team",
    ],
    result: [
      "A daily digest replaces the manual morning check",
      "Every notice arrives with its closing date and documents",
      "Runs on n8n, RSS and Slack, with no licence costs",
    ],
    stack: ["n8n", "RSS", "Slack", "Google Sheets", "Claude"],
    keywords: [
      "tender", "procurement", "scrape", "scraping", "monitor", "alert", "slack", "rss", "automation", "automate",
      "n8n", "digest", "government", "council", "cleaning", "security", "manual", "every day", "daily", "workflow",
      "notification", "check",
    ],
    hero: true,
  },
  {
    slug: "codevantage-people",
    number: "05",
    discipline: "People",
    client: { name: "Codevantage", anonymised: "A software company, Coimbatore", public: true },
    place: "Coimbatore",
    status: "Sep 2025 – present",
    brief:
      "Hiring takes weeks, [[people data lives in five spreadsheets]], and leadership [[can't see how the team is actually doing]] until someone resigns.",
    wording: "paraphrased",
    marks: {
      "people data lives in five spreadsheets":
        "Consolidated into one people dataset with dashboards for headcount, tenure, engagement and performance visibility.",
      "can't see how the team is actually doing":
        "Rituals and processes came before tools: check-ins, review cycles and a weekly people report. Then the automation to run them without me.",
    },
    built: [
      "Resume parsing and scoring workflow in n8n, shortlist by fit",
      "People dashboards for leadership",
      "Hiring pipeline with automated first-round screening",
      "Rituals and processes that bridge leadership and staff",
      "HR automation workflows for the recurring admin",
    ],
    result: [
      "Screening moved from an inbox to a scored shortlist",
      "Leadership sees people metrics weekly, not at exit interviews",
      "Productivity and performance visibility improved across the team",
    ],
    stack: ["n8n", "Python", "Google Sheets", "Notion", "Claude"],
    keywords: [
      "hiring", "hire", "recruit", "hr", "people", "resume", "cv", "ats", "screening", "attrition", "retention",
      "employee", "engagement", "onboarding", "performance", "dashboard", "analyst", "team", "culture", "talent",
      "workforce", "payroll", "leave",
    ],
    hero: true,
  },
  {
    slug: "eco-clean-whatsapp-leads",
    number: "04",
    discipline: "Marketing",
    client: {
      name: "Eco Clean Enterprises",
      anonymised: "An engine-decarbonisation workshop, Kerala",
      public: false,
    },
    place: "Irinjalakuda",
    status: "2026",
    brief:
      "The ads get clicks but [[nobody calls]]. We're a workshop, not a website. [[Customers want to WhatsApp us]], not fill in a form.",
    wording: "paraphrased",
    marks: {
      "nobody calls":
        "Clicks were landing on a page with no next step. The campaign objective moved to messaging, so the click itself opens WhatsApp with a first message already written.",
      "Customers want to WhatsApp us":
        "Click-to-WhatsApp campaigns with a radius audience around the workshop, creatives built for the local audience, and a weekly report the owner can read in two minutes.",
    },
    built: [
      "Meta click-to-WhatsApp lead campaigns",
      "Radius targeting around the workshop",
      "Ad creatives and copy for a local audience",
      "Clicks-versus-leads diagnostics",
      "A Claude skill that pulls campaign status and writes the client report",
    ],
    result: [
      "Leads arrive as WhatsApp conversations, not form fills",
      "The owner gets a plain-language report every week",
      "Every change to spend is confirmed with the client first",
    ],
    stack: ["Meta Ads", "WhatsApp", "Claude", "Facebook Ads MCP"],
    keywords: [
      "meta", "facebook", "instagram", "whatsapp", "ads", "leads", "local", "workshop", "small business", "campaign",
      "kerala", "creative", "report", "calls", "phone", "shop", "clinic", "restaurant", "budget", "spend",
    ],
  },
  {
    slug: "fine-jewellery-direct",
    number: "03",
    discipline: "Studio",
    client: {
      name: "NOT A BASIC",
      anonymised: "A direct-to-customer fine jewellery label",
      public: false,
    },
    place: "Online",
    status: "In progress",
    brief:
      "We want to sell fine jewellery direct, online, and [[not look like every other Shopify store]]. The photography has to feel real. [[We can't afford a shoot every month]].",
    wording: "paraphrased",
    marks: {
      "not look like every other Shopify store":
        "An editorial homepage: quiet, product-first, no template blocks. The build plan covers theme, collections, checkout and the launch calendar.",
      "We can't afford a shoot every month":
        "AI-assisted product photography with exact product fidelity, and a carousel system for daily posts. Believable, not glossy.",
    },
    built: [
      "Shopify build plan and editorial homepage design",
      "AI-assisted product photography with fidelity checks",
      "Instagram carousel system for daily posts",
      "Launch content calendar",
    ],
    result: [
      "Homepage design and build plan complete",
      "Carousel system ready for launch content",
    ],
    stack: ["Shopify", "Claude", "Higgsfield", "Figma"],
    keywords: [
      "shopify", "ecommerce", "e-commerce", "store", "jewellery", "jewelry", "product", "photography", "brand",
      "launch", "instagram", "carousel", "content", "d2c", "online shop", "catalogue", "fashion",
    ],
  },
  {
    slug: "cj-studios-production-system",
    number: "02",
    discipline: "Studio",
    client: { name: "CJ Studios", anonymised: "CJ Studios", public: true },
    place: "Australia",
    status: "Ongoing",
    brief:
      "Clients want [[cinematic ads by Friday]] on a budget that doesn't cover a crew. Every reel [[has to hold attention for fifteen seconds]] or the spend is wasted.",
    wording: "paraphrased",
    marks: {
      "cinematic ads by Friday":
        "A production system, not a prompt: concept, reference image, then a single-generation clip prompt. Seedance 2.0 on Higgsfield, with Kling and Dreamina as fallbacks.",
      "has to hold attention for fifteen seconds":
        "Every reel is written to loop: hook in the first second, payoff at fourteen, cut tight in post. The system is encoded as Claude skills so anyone in the studio can run it.",
    },
    built: [
      "Fifteen-second reel system for Seedance 2.0 on Higgsfield",
      "Reference-image and clip-prompt workflow",
      "Brand carousel system with product fidelity rules",
      "Claude skills so the process repeats without me",
      "cjstudios.tech, with no visitor tracking",
    ],
    result: [
      "Concept to finished reel in one working day",
      "The same skills reused across clients",
      "A studio site that collects no visitor data",
    ],
    stack: ["Seedance 2.0", "Higgsfield", "Kling", "Claude", "Next.js"],
    keywords: [
      "video", "reel", "ai video", "content", "social", "tiktok", "instagram", "creative", "production", "cinematic",
      "short-form", "ugc", "3d", "film", "ad creative", "brand film", "studio",
    ],
  },
];

export const method = [
  {
    title: "Read the brief twice.",
    body: "Once for what you asked, once for what it is costing you. The second reading is usually the job.",
  },
  {
    title: "Measure before building.",
    body: "Tags, pipelines, a baseline. If we cannot see it, we cannot claim we improved it.",
  },
  {
    title: "Build the smallest system that runs without me.",
    body: "n8n where it fits, code where it does not, and a handover document either way.",
  },
  {
    title: "Report in your language.",
    body: "A weekly page you can read in two minutes, with numbers you would repeat to a partner.",
  },
];

export const founder = {
  heading: "I co-founded CJ Studios so small businesses could afford production that used to need a crew.",
  body: [
    "CJ Studios is a creative AI production and business automation studio working with Australian businesses. Cinematic video, 3D experiences, and the automations that turn attention into booked work.",
    "I run client relationships and end-to-end marketing: strategy, paid media, websites, SEO, analytics, and the AI-assisted workflows behind them. The other half of my week is people analytics, where the same habit applies: measure first, then automate the recurring work.",
  ],
};

export const roles = [
  {
    title: "Co-founder",
    org: "CJ Studios",
    place: "Australia",
    period: "Current",
    note: "Client management, marketing strategy, paid advertising, websites and SEO, creative production, CRM and analytics, business operations.",
  },
  {
    title: "HR Analyst & Automation Specialist",
    org: "Codevantage",
    place: "Coimbatore",
    period: "Sep 2025 – present",
    note: "People data, employee experience and HR automation workflows. The bridge between leadership and staff through rituals, processes and dashboards.",
  },
  {
    title: "Logistics intern",
    org: "Symega Food Ingredients",
    place: "Ernakulam",
    period: "Mar – Sep 2025",
    note: "SAP logistics modules for shipments, dispatch records and e-way bills. Proposed a predictive delivery model in Python from dispatch throughput analysis.",
  },
];

export const education = [
  {
    title: "MSc Data Science with Logistics and Supply Chain Management",
    org: "Amrita Vishwa Vidyapeetham",
    place: "Coimbatore",
    period: "2023 – 2025",
  },
  {
    title: "BCA in Data Science",
    org: "Amrita Vishwa Vidyapeetham",
    place: "Kollam",
    period: "2020 – 2023",
  },
];

export const research = [
  {
    title: "Hybrid machine learning for stock price prediction",
    body: "Exponential smoothing, decision-tree regression and an LSTM–random forest hybrid, 15% more accurate than the traditional models it was compared against.",
  },
  {
    title: "Medical image analysis with deep learning",
    body: "MobileNetV2, CNNs and the Swin Transformer compared on a medical image set. Swin was best for fine-grained classification, at up to 92% accuracy.",
  },
  {
    title: "Early detection of Parkinson's disease",
    body: "Decision tree, KNN and SVM models on voice features, deployed as a Django web app so clinicians could use it.",
  },
  {
    title: "Ultrasonic radar for vehicle blind spots",
    body: "An Arduino Nano prototype for real-time detection of rear and side blind zones.",
  },
  {
    title: "Reducing complexity: dimensionality-reduction techniques compared",
    body: "Published on ResearchGate. Singular value decomposition cut feature dimensions substantially and sped up model training on high-dimensional data.",
    link: "",
  },
];

export const certifications = [
  { title: "Introduction to Data Engineering", org: "IBM" },
  { title: "Data Privacy for Information Architecture", org: "IBM" },
  { title: "Data Analytics and Visualization Job Simulation", org: "Accenture" },
  { title: "Data Visualization: Empowering Business with Effective Insights", org: "TATA Group" },
];

export const toolkit = [
  { area: "Automation", tools: "n8n, webhooks, Claude Code, Codex, Python", line: "The wiring between tools, and the agent that watches it." },
  { area: "Measurement", tools: "Google Tag Manager, GA4, Meta pixel, HubSpot, Power BI", line: "Every enquiry gets a source." },
  { area: "Paid media", tools: "Meta Ads, Google Ads", line: "Targeting, creatives, budgets, lead quality." },
  { area: "Web", tools: "Next.js, WordPress, Shopify, Tailwind", line: "Fast pages that convert, on the platform you already have." },
  { area: "Production", tools: "Seedance 2.0, Higgsfield, Kling, Figma", line: "Cinematic content on a small-business budget." },
  { area: "Data", tools: "Python, SQL, pandas, scikit-learn, TensorFlow, SAP", line: "The analyst underneath all of it." },
];

export const systems = [
  { name: "Tender Radar", line: "AusTender and council portals → scored daily digest in Slack" },
  { name: "Resume ATS", line: "Applications → parsed, scored, shortlisted in n8n" },
  { name: "Meta Ads agent", line: "Campaign status → plain-language client reports" },
  { name: "Blog agent", line: "Industry news → drafted articles → Notion" },
  { name: "End-of-day report", line: "Task tracker → summary posted to Slack" },
  { name: "Reel production", line: "Concept → reference image → clip prompt, as Claude skills" },
];
