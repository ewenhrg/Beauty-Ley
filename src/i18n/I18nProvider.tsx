"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import { makeTranslate, type CatalogMessages, type Messages, type Translate } from "./format";

type CatalogLabel = (key: string, fallback?: string) => string;

const I18nContext = createContext<{ locale: Locale; t: Translate; label: CatalogLabel } | null>(null);

/**
 * Receives only the current language's strings from the server (layout), so the
 * browser downloads one dictionary instead of all seven.
 */
export function I18nProvider({
  locale,
  messages,
  catalog,
  children,
}: {
  locale: Locale;
  messages: Messages;
  catalog: CatalogMessages;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      locale,
      t: makeTranslate(messages),
      label: (key: string, fallback = "") => catalog[key] ?? fallback,
    }),
    [locale, messages, catalog],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export function useLocale() {
  return useI18n().locale;
}

/** Service names, groups and notes from the price catalog, in the page's language. */
export function useCatalogLabel() {
  return useI18n().label;
}
