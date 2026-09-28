import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { person } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

const gloock = localFont({
  src: "./fonts/gloock-latin.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-gloock",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  weight: "400 800",
  style: "normal",
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["system-ui", "sans-serif"],
});

const title = `${person.name} | AI Automation Engineer, HR Analyst, Co-founder of CJ Studios`;
const description =
  "Send the problem, get back a system. AI automation, HR analytics and growth marketing by Abhiram Anil, co-founder of CJ Studios. Casework, method and a brief you can send in one line.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  keywords: [
    "Abhiram Anil", "AI automation engineer", "HR analyst", "growth marketing", "n8n", "CJ Studios",
    "Meta Ads", "Google Tag Manager", "HubSpot", "people analytics", "Kerala", "Australia",
  ],
  authors: [{ name: person.name, url: siteUrl }],
  creator: person.name,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: person.name,
    title,
    description,
    locale: "en_AU",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" as const };

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  url: siteUrl,
  email: `mailto:${person.email}`,
  jobTitle: "AI Automation Engineer, HR Analyst, Co-founder",
  worksFor: [
    { "@type": "Organization", name: "CJ Studios", url: person.studio.url },
    { "@type": "Organization", name: "Codevantage" },
  ],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Amrita Vishwa Vidyapeetham" },
  sameAs: [person.linkedin, person.github, person.studio.url],
  knowsAbout: [
    "AI automation", "n8n", "HR analytics", "People analytics", "Growth marketing", "Meta Ads",
    "Google Tag Manager", "GA4", "HubSpot", "Data science", "Machine learning",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${gloock.variable} ${archivo.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <noscript>
          <style>{`[data-reveal] .hl{background-size:100% 86%;color:var(--mark-ink)}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-mark focus:px-3 focus:py-2 focus:text-mark-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
