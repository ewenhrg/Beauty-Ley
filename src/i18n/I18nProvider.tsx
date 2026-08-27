"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import { translator, type Translate } from "./t";

const I18nContext = createContext<{ locale: Locale; t: Translate } | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: translator(locale) }}>{children}</I18nContext.Provider>
  );
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
