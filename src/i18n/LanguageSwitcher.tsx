"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { LOCALES, LOCALE_COOKIE, LOCALE_META, type Locale } from "./config";
import { useLocale } from "./I18nProvider";
import { localizePath, splitLocale } from "./paths";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

/**
 * Real links to each translation (`/fr/...`, `/de/...`): crawlable by search
 * engines, and the cookie remembers the choice for the visitor's next visit.
 * Admin URLs carry no language, so there the cookie alone switches it.
 */
export function LanguageSwitcher({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  const { path } = splitLocale(pathname);

  const pick = (next: Locale, event: MouseEvent<HTMLAnchorElement>) => {
    rememberLocale(next);
    if (admin) {
      event.preventDefault();
      if (next !== locale) window.location.reload();
    }
  };

  const tone = (selected: boolean) =>
    selected
      ? light
        ? compact
          ? "border-cream bg-cream text-terracotta"
          : "bg-cream text-terracotta"
        : compact
          ? "border-terracotta bg-terracotta text-cream"
          : "bg-terracotta text-cream"
      : light
        ? compact
          ? "border-cream/40 text-cream/80 hover:border-cream hover:text-cream"
          : "text-cream/75 hover:bg-cream/15 hover:text-cream"
        : compact
          ? "border-line text-ink-soft hover:border-terracotta/50 hover:text-ink"
          : "text-ink-soft hover:bg-blush/40 hover:text-ink";

  return (
    <div
      className={compact ? "flex flex-wrap items-center gap-1.5" : "flex flex-wrap items-center gap-1"}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => {
        const selected = code === locale;
        return (
          <a
            key={code}
            href={admin ? pathname : localizePath(code, path)}
            hrefLang={LOCALE_META[code].html}
            lang={LOCALE_META[code].html}
            title={LOCALE_META[code].label}
            aria-current={selected ? "true" : undefined}
            onClick={(event) => pick(code, event)}
            className={`inline-flex h-9 items-center justify-center rounded-full px-2.5 text-[10px] tracking-wide transition-colors ${
              compact ? "min-w-9 border" : ""
            } ${tone(selected)}`}
          >
            {LOCALE_META[code].short}
          </a>
        );
      })}
    </div>
  );
}
