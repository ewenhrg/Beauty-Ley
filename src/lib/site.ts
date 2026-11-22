function withProtocol(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

/** The public domain: canonical URLs, sitemap, hreflang and JSON-LD all point here. */
export const PRODUCTION_URL = "https://beautyleyhrg.com";

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return withProtocol(explicit);

  // Production deploys always use the real domain, never a *.vercel.app alias.
  if (process.env.VERCEL_ENV === "production") return PRODUCTION_URL;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return withProtocol(vercel);

  return "http://localhost:3000";
}
