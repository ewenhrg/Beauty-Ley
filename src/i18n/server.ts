import { locale as rootLocale } from "next/root-params";
import { parseLocale, type Locale } from "./config";
import { translator, type Translate } from "./t";

/** Locale of the public site, read from the `[locale]` URL segment. */
export async function getLocale(): Promise<Locale> {
  return parseLocale(await rootLocale());
}

export async function getT(): Promise<Translate> {
  return translator(await getLocale());
}
