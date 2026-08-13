import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = `${profile.name} — ${profile.role}`;

export const metadata: Metadata = {
  title,
  description: profile.summary,
  keywords: [
    "data science",
    "people analytics",
    "machine learning",
    "n8n automation",
    "HR analytics",
    profile.name,
  ],
  authors: [{ name: profile.name }],
  openGraph: {
    title,
    description: profile.summary,
    type: "profile",
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: profile.summary,
  },
};

export const viewport: Viewport = {
  themeColor: "#07070a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
