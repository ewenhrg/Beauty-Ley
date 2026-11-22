import type { MessageKey } from "./messages";

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;
export type Messages = Record<MessageKey, string>;
export type CatalogMessages = Record<string, string>;

/**
 * Builds `t()` from one language's dictionary. Kept free of the dictionaries
 * themselves so client components never bundle all seven languages.
 */
export function makeTranslate(messages: Messages): Translate {
  return (key, vars) => {
    let value = messages[key] ?? key;
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replaceAll(`{${name}}`, String(replacement));
      }
    }
    return value;
  };
}
