export const LOCALES = ["en", "fr", "de", "it", "es", "ru", "zh", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "bl_lang";

export const LOCALE_META: Record<
  Locale,
  { label: string; short: string; html: string; og: string; intl: string; dir: "ltr" | "rtl" }
> = {
  en: { label: "English", short: "EN", html: "en", og: "en_GB", intl: "en-GB", dir: "ltr" },
  fr: { label: "Français", short: "FR", html: "fr", og: "fr_FR", intl: "fr-FR", dir: "ltr" },
  de: { label: "Deutsch", short: "DE", html: "de", og: "de_DE", intl: "de-DE", dir: "ltr" },
  it: { label: "Italiano", short: "IT", html: "it", og: "it_IT", intl: "it-IT", dir: "ltr" },
  es: { label: "Español", short: "ES", html: "es", og: "es_ES", intl: "es-ES", dir: "ltr" },
  ru: { label: "Русский", short: "RU", html: "ru", og: "ru_RU", intl: "ru-RU", dir: "ltr" },
  zh: { label: "中文", short: "中文", html: "zh-CN", og: "zh_CN", intl: "zh-CN", dir: "ltr" },
  ar: { label: "العربية", short: "عربي", html: "ar", og: "ar_EG", intl: "ar-EG", dir: "rtl" },
};

export function parseLocale(value: string | undefined | null): Locale {
  if (value && (LOCALES as readonly string[]).includes(value)) return value as Locale;
  return DEFAULT_LOCALE;
}

export function intlLocale(locale: Locale) {
  return LOCALE_META[locale].intl;
}
