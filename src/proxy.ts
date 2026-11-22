import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { localizePath, splitLocale } from "@/i18n/paths";

function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

/**
 * Public URLs: English at the root, other languages under `/fr`, `/de`, …
 * Internally every page lives under `app/[locale]`, so unprefixed English URLs
 * are rewritten to `/en/...`. Pages stay statically cached: nothing here reads
 * a per-visitor value that would change the HTML.
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { locale, path } = splitLocale(url.pathname);

  // Legacy `?lang=fr` links → the language's own URL.
  const fromQuery = url.searchParams.get("lang");
  if (isLocale(fromQuery)) {
    url.searchParams.delete("lang");
    url.pathname = localizePath(fromQuery, path);
    return NextResponse.redirect(url, 308);
  }

  // `/en/...` duplicates the root: send it to the canonical URL.
  if (locale === DEFAULT_LOCALE) {
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }

  if (locale) return NextResponse.next();

  // Returning visitor who picked another language: keep them in it.
  // Crawlers carry no cookie, so they always get the English page here.
  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(preferred) && preferred !== DEFAULT_LOCALE) {
    url.pathname = localizePath(preferred, path);
    return NextResponse.redirect(url, 307);
  }

  url.pathname = `/${DEFAULT_LOCALE}${path === "/" ? "" : path}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/|api/|admin|images/|icons/|icon|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
