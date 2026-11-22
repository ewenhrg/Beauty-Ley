import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Back office, API and private appointment links have nothing to index.
      disallow: ["/admin", "/api/", "/rendez-vous/", "/*/rendez-vous/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
