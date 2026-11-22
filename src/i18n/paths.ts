import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";

/**
 * URL scheme: English lives at the root (`/tarifs`), every other language under
 * its own prefix (`/fr/tarifs`). One URL per language is what lets search engines
 * index each translation and match it to searches in that language.
 */
export function localizePath(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;
  if (locale === DEFAULT_LOCALE) return href;
  if (href === "/") return `/${locale}`;
  if (href.startsWith("/#") || href.startsWith("/?")) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

/** Splits `/fr/tarifs` into `{ locale: "fr", path: "/tarifs" }`. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const [, first = "", ...rest] = pathname.split("/");
  if ((LOCALES as readonly string[]).includes(first)) {
    return { locale: first as Locale, path: `/${rest.join("/")}` };
  }
  return { locale: null, path: pathname || "/" };
}

/** hreflang map for one page, ready for `metadata.alternates.languages`. */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale === "zh" ? "zh-CN" : locale] = localizePath(locale, path);
  }
  languages["x-default"] = localizePath(DEFAULT_LOCALE, path);
  return languages;
}
