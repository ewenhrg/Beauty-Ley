import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale, type Locale } from "./config";
import { translator, type Translate } from "./t";

/** Admin pages have no locale in the URL: they follow the visitor's language cookie. */
export async function getAdminLocale(): Promise<Locale> {
  const jar = await cookies();
  return parseLocale(jar.get(LOCALE_COOKIE)?.value);
}

export async function getAdminT(): Promise<Translate> {
  return translator(await getAdminLocale());
}
