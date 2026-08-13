/**
 * Single source of truth for every piece of content on the site.
 *
 * Everything the portfolio renders comes from this file — edit here, never in
 * the components. Fields marked `TODO` were not recoverable from the old
 * deployment and need real values before this goes live.
 */

export type Profile = {
  name: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  available: boolean;
  summary: string;
  resumeUrl: string | null;
};

export const profile: Profile = {
  name: "Abhiram Anil",
  role: "HR Analyst",
  tagline: "Crafting intelligent workflows in a spatial dimension",
  // TODO: confirm — inferred from the Symega role being based in Kerala.
  location: "Kerala, India",
  email: "abhiramaanil@gmail.com",
  available: true,
  summary:
    "Data scientist working where people analytics meets automation. I build models that explain why teams churn, pipelines that move data without anyone touching it, and interfaces that make the results legible to the people who act on them.",
  // TODO: drop a PDF in /public and point this at it, e.g. "/abhiram-anil-cv.pdf".
  resumeUrl: null,
};

export type SocialLink = {
  label: string;
  href: string;
  handle: string;
};

// TODO: replace the placeholder hrefs with your real profile URLs.
export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/abteeeen", handle: "@abteeeen" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/abhiram-anil",
    handle: "/in/abhiram-anil",
  },
  { label: "Email", href: "mailto:abhiramaanil@gmail.com", handle: "abhiramaanil@gmail.com" },
];

export type Skill = {
  name: string;
  level: number;
  group: "AI / ML" | "Data" | "Automation" | "Engineering";
  note: string;
};

export const skills: Skill[] = [
  {
    name: "Python",
    level: 95,
    group: "AI / ML",
    note: "Primary language — modelling, ETL, and everything glued between them.",
  },
  {
    name: "n8n Automation",
    level: 92,
    group: "Automation",
    note: "Self-hosted workflow orchestration wiring APIs, databases, and models together.",
  },
  {
    name: "Machine Learning",
    level: 90,
    group: "AI / ML",
    note: "Classification, forecasting, and survival-style attrition modelling.",
  },
  {
    name: "SQL",
    level: 90,
    group: "Data",
    note: "Window functions, CTEs, and query tuning over operational warehouses.",
  },
  {
    name: "TensorFlow / PyTorch",
    level: 88,
    group: "AI / ML",
    note: "Deep learning for imaging and sequence problems.",
  },
  {
    name: "React / Next.js",
    level: 85,
    group: "Engineering",
    note: "Turning models into interfaces people will actually open.",
  },
  {
    name: "AWS",
    level: 82,
    group: "Engineering",
    note: "S3, EC2, and Lambda for training jobs and scheduled pipelines.",
  },
  {
    name: "Docker",
    level: 80,
    group: "Engineering",
    note: "Reproducible environments so a model runs the same everywhere.",
  },
];

export const techMarquee = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "scikit-learn",
  "Pandas",
  "n8n",
  "SQL",
  "PostgreSQL",
  "React",
  "Next.js",
  "TypeScript",
  "Docker",
  "AWS",
  "Power BI",
];

export type Stat = {
  value: number;
  suffix: string;
  label: string;
  detail: string;
};

export const stats: Stat[] = [
  { value: 18, suffix: "+", label: "Projects shipped", detail: "ML, automation, and analytics work" },
  { value: 3, suffix: "", label: "Cloud certifications", detail: "AWS, Google, and IBM" },
  { value: 92, suffix: "%", label: "Best model accuracy", detail: "Medical imaging classifier" },
  { value: 2, suffix: "+", label: "Years in analytics", detail: "Logistics into people analytics" },
];

export type Experience = {
  role: string;
  org: string;
  period: string;
  current: boolean;
  kind: "work" | "education";
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    role: "HR Analyst",
    org: "TODO: company name",
    period: "Sep 2025 — Present",
    current: true,
    kind: "work",
    summary:
      "People analytics for hiring and retention — building the models and the automation that surrounds them.",
    highlights: [
      "Built an attrition prediction model to flag retention risk before exit interviews do.",
      "Developed a recruitment matching algorithm scoring candidates against role requirements.",
      "Automated ATS data flows so screening and reporting no longer need manual exports.",
    ],
    stack: ["Python", "scikit-learn", "n8n", "SQL"],
  },
  {
    role: "Logistics Analyst",
    org: "Symega Food Ingredients",
    period: "Mar 2025 — Sep 2025",
    current: false,
    kind: "work",
    summary:
      "Supply chain analytics across sourcing and distribution, focused on where cost and time leaked.",
    highlights: [
      "Modelled route and inventory data to surface optimisation opportunities.",
      "Built reporting that replaced recurring manual spreadsheet consolidation.",
    ],
    stack: ["Python", "SQL", "Power BI"],
  },
  {
    role: "MSc Data Science",
    org: "TODO: university name",
    period: "2023 — 2025",
    current: false,
    kind: "education",
    summary:
      "Specialised in logistics and supply chain analytics, with dissertation work in applied machine learning.",
    highlights: [
      "Focus on optimisation, forecasting, and applied statistics.",
      "Coursework spanning deep learning, NLP, and large-scale data processing.",
    ],
    stack: ["Python", "R", "SQL"],
  },
];

export type Certification = {
  name: string;
  issuer: string;
  year: string;
  credentialUrl: string | null;
};

// TODO: replace with exact certificate titles, issue dates, and credential links.
export const certifications: Certification[] = [
  { name: "Cloud Practitioner", issuer: "AWS", year: "TODO", credentialUrl: null },
  { name: "Data Analytics Professional", issuer: "Google", year: "TODO", credentialUrl: null },
  { name: "Data Science Professional", issuer: "IBM", year: "TODO", credentialUrl: null },
];

export type Project = {
  title: string;
  category: "AI / ML" | "People Analytics" | "Automation" | "Data";
  blurb: string;
  problem: string;
  approach: string;
  result: string;
  metric: string | null;
  stack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
};

/**
 * Metrics below are the ones carried over from the previous deployment.
 * Anything else is described structurally on purpose — fill in the real
 * numbers rather than letting an approximation stand.
 */
export const projects: Project[] = [
  {
    title: "Medical Imaging Classifier",
    category: "AI / ML",
    blurb: "Convolutional network for diagnostic image classification.",
    problem:
      "Diagnostic screening leans on scarce specialist attention, and early-stage signals are easy to miss at volume.",
    approach:
      "Trained a convolutional architecture over a labelled imaging set with augmentation and transfer learning to compensate for limited samples.",
    result: "Reached 92% classification accuracy on the held-out evaluation set.",
    metric: "92% accuracy",
    stack: ["Python", "TensorFlow", "OpenCV"],
    repoUrl: null,
    liveUrl: null,
    featured: true,
  },
  {
    title: "Customer Churn Prediction",
    category: "AI / ML",
    blurb: "Retention risk scoring across a customer base.",
    problem:
      "Churn is only visible after the customer is gone, which leaves no window for intervention.",
    approach:
      "Engineered behavioural and transactional features, then compared gradient-boosted trees against a regularised linear baseline, tuning the decision threshold for precision.",
    result: "Achieved 89% precision on churn identification.",
    metric: "89% precision",
    stack: ["Python", "scikit-learn", "Pandas"],
    repoUrl: null,
    liveUrl: null,
    featured: true,
  },
  {
    title: "Employee Attrition Predictor",
    category: "People Analytics",
    blurb: "Model flagging retention risk before it becomes a resignation.",
    problem:
      "Exit interviews explain departures far too late to act on them, and managers get no early signal.",
    approach:
      "Combined tenure, compensation, and engagement features into a classifier, prioritising interpretable drivers so HR could act on the output rather than just read a score.",
    result: "Reached 88% accuracy identifying at-risk employees.",
    metric: "88% accuracy",
    stack: ["Python", "scikit-learn", "SQL"],
    repoUrl: null,
    liveUrl: null,
    featured: true,
  },
  {
    title: "Recruitment Matching Algorithm",
    category: "People Analytics",
    blurb: "Candidate-to-role scoring built into the hiring pipeline.",
    problem:
      "Manual CV screening scales badly and applies inconsistent judgement across reviewers.",
    approach:
      "Parsed CVs and role descriptions into comparable representations, scoring candidates by semantic and structured overlap against role requirements.",
    result: "Cut first-pass screening effort and made shortlisting criteria explicit.",
    metric: null,
    stack: ["Python", "NLP", "n8n"],
    repoUrl: null,
    liveUrl: null,
    featured: true,
  },
  {
    title: "Parkinson's Detection",
    category: "AI / ML",
    blurb: "Early-stage detection from biomedical signal data.",
    problem:
      "Motor-symptom onset is gradual, and clinical detection typically happens well after changes begin.",
    approach:
      "Trained classifiers over voice and motor measurement features, with careful cross-validation given the small-sample regime typical of clinical datasets.",
    result: "Produced a working detection pipeline over the biomedical feature set.",
    metric: null,
    stack: ["Python", "scikit-learn", "NumPy"],
    repoUrl: null,
    liveUrl: null,
    featured: false,
  },
  {
    title: "Stock Movement Prediction",
    category: "AI / ML",
    blurb: "Sequence model over historical market data.",
    problem:
      "Price series are noisy and non-stationary, so naive models fit history and fail forward.",
    approach:
      "Built an LSTM over windowed historical sequences with technical indicators as additional features, validated on strictly forward-in-time splits.",
    result: "Delivered a forecasting pipeline with honest out-of-sample evaluation.",
    metric: null,
    stack: ["Python", "TensorFlow", "Pandas"],
    repoUrl: null,
    liveUrl: null,
    featured: false,
  },
  {
    title: "NLP Sentiment Analysis",
    category: "AI / ML",
    blurb: "Sentiment classification over unstructured text feedback.",
    problem:
      "Free-text feedback holds the useful signal but resists aggregation at any real volume.",
    approach:
      "Built a text preprocessing and classification pipeline, moving from bag-of-words baselines to transformer embeddings.",
    result: "Turned unstructured responses into trackable sentiment measures.",
    metric: null,
    stack: ["Python", "NLTK", "Transformers"],
    repoUrl: null,
    liveUrl: null,
    featured: false,
  },
  {
    title: "Route Optimisation Engine",
    category: "Data",
    blurb: "Distribution routing across a logistics network.",
    problem:
      "Delivery routes were planned by habit, leaving distance and fuel cost on the table every cycle.",
    approach:
      "Modelled the network as a constrained routing problem and applied optimisation heuristics against real distance and capacity data.",
    result: "Identified concrete distance reductions against existing planned routes.",
    metric: null,
    stack: ["Python", "OR-Tools", "SQL"],
    repoUrl: null,
    liveUrl: null,
    featured: false,
  },
];

export const navItems = [
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Path", href: "#path" },
  { label: "Contact", href: "#contact" },
];
