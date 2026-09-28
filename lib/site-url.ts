/**
 * Canonical site URL, used for metadata, OpenGraph, the sitemap and robots.
 *
 * 1. NEXT_PUBLIC_SITE_URL, if set (only needed for a custom domain).
 * 2. Otherwise the Vercel production address (e.g. abhiram-anil.vercel.app),
 *    which Vercel provides automatically at build time.
 * 3. Otherwise localhost, for local builds.
 */
function withProtocol(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  try {
    return new URL(/^https?:\/\//.test(v) ? v : `https://${v}`).origin;
  } catch {
    return null;
  }
}

export const siteUrl =
  withProtocol(process.env.NEXT_PUBLIC_SITE_URL ?? "") ??
  withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "") ??
  "http://localhost:3000";
