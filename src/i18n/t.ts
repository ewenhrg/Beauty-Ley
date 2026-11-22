import type { Locale } from "./config";
import { dictionaries, type MessageKey } from "./messages";
import { makeTranslate, type Messages, type Translate } from "./format";

export type { Translate };

/** Server only: the full dictionaries never reach the browser. */
export function messagesFor(locale: Locale): Messages {
  return locale === "en" ? dictionaries.en : { ...dictionaries.en, ...dictionaries[locale] };
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  return makeTranslate(messagesFor(locale))(key, vars);
}

export function translator(locale: Locale): Translate {
  return makeTranslate(messagesFor(locale));
}
