import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { languageAlternates, localizePath } from "@/i18n/paths";
import { PAGE_PATHS } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

/** Every public page in every language, each listing its translations (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const absolute = (path: string) => `${base}${path === "/" ? "" : path}` || base;
  const lastModified = new Date();

  return Object.entries(PAGE_PATHS).flatMap(([page, path]) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([lang, href]) => [lang, absolute(href)]),
    );
    return LOCALES.map((locale) => ({
      url: absolute(localizePath(locale, path)),
      lastModified,
      changeFrequency: page === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: page === "home" ? 1 : page === "services" || page === "prices" ? 0.9 : 0.7,
      alternates: { languages },
    }));
  });
}
