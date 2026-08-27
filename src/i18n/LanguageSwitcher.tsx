"use client";

import { LOCALES, LOCALE_COOKIE, LOCALE_META, type Locale } from "./config";
import { useLocale } from "./I18nProvider";

export function LanguageSwitcher({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  const locale = useLocale();

  const pick = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.assign(url.toString());
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {LOCALES.map((code) => {
          const selected = code === locale;
          return (
            <button
              key={code}
              type="button"
              onClick={() => pick(code)}
              aria-pressed={selected}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2.5 text-[10px] tracking-[0.16em] uppercase transition-colors ${
                selected
                  ? light
                    ? "border-cream bg-cream text-terracotta"
                    : "border-terracotta bg-terracotta text-cream"
                  : light
                    ? "border-cream/40 text-cream/80 hover:border-cream hover:text-cream"
                    : "border-line text-ink-soft hover:border-terracotta/50 hover:text-ink"
              }`}
            >
              {LOCALE_META[code].short}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Language">
      {LOCALES.map((code) => {
        const selected = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => pick(code)}
            aria-pressed={selected}
            title={LOCALE_META[code].label}
            className={`inline-flex h-9 items-center justify-center rounded-full px-2.5 text-[10px] tracking-[0.16em] uppercase transition-colors ${
              selected
                ? light
                  ? "bg-cream text-terracotta"
                  : "bg-terracotta text-cream"
                : light
                  ? "text-cream/75 hover:bg-cream/15 hover:text-cream"
                  : "text-ink-soft hover:bg-blush/40 hover:text-ink"
            }`}
          >
            {LOCALE_META[code].short}
          </button>
        );
      })}
    </div>
  );
}
