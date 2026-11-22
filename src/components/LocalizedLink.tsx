"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/i18n/I18nProvider";
import { localizePath } from "@/i18n/paths";

/** `next/link` that keeps the visitor in their language (`/tarifs` → `/fr/tarifs`). */
export function LocalizedLink({ href, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const locale = useLocale();
  return <Link href={localizePath(locale, href)} {...props} />;
}
