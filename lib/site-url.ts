/** Canonical site URL. Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is live. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://abhiramanil.vercel.app").replace(/\/$/, "");
