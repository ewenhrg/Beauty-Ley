export const LOCALES = ["en", "fr", "de", "it", "es", "ru", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "bl_lang";

export const LOCALE_META: Record<
  Locale,
  { label: string; short: string; html: string; og: string; intl: string }
> = {
  en: { label: "English", short: "EN", html: "en", og: "en_GB", intl: "en-GB" },
  fr: { label: "Français", short: "FR", html: "fr", og: "fr_FR", intl: "fr-FR" },
  de: { label: "Deutsch", short: "DE", html: "de", og: "de_DE", intl: "de-DE" },
  it: { label: "Italiano", short: "IT", html: "it", og: "it_IT", intl: "it-IT" },
  es: { label: "Español", short: "ES", html: "es", og: "es_ES", intl: "es-ES" },
  ru: { label: "Русский", short: "RU", html: "ru", og: "ru_RU", intl: "ru-RU" },
  zh: { label: "中文", short: "中文", html: "zh-CN", og: "zh_CN", intl: "zh-CN" },
};

export function parseLocale(value: string | undefined | null): Locale {
  if (value && (LOCALES as readonly string[]).includes(value)) return value as Locale;
  return DEFAULT_LOCALE;
}

export function intlLocale(locale: Locale) {
  return LOCALE_META[locale].intl;
}
