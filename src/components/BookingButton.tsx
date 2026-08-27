"use client";

import Link from "next/link";

import { useT } from "@/i18n/I18nProvider";

type Props = {
  variant?: "solid" | "ghost" | "light";
  /** Preselects a prestation in the booking flow. */
  serviceId?: string;
  className?: string;
  children?: React.ReactNode;
};

const VARIANTS = {
  solid: "bg-terracotta text-cream hover:bg-rose shadow-soft hover:shadow-glow",
  ghost: "border border-terracotta/40 text-ink hover:border-rose hover:text-rose bg-transparent",
  light: "bg-cream text-terracotta hover:bg-white shadow-soft hover:shadow-glow",
} as const;

const BASE =
  "inline-flex min-h-11 items-center justify-center px-6 py-3 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:scale-[1.02]";

/** Public CTA that always opens the reservation page. */
export function BookingButton({
  variant = "solid",
  className = "",
  serviceId,
  children,
}: Props) {
  const t = useT();
  const styles = VARIANTS[variant];
  const href = serviceId ? `/reservation?service=${encodeURIComponent(serviceId)}` : "/reservation";

  return (
    <Link href={href} className={`${BASE} ${styles} ${className}`}>
      {children ?? t("cta.book")}
    </Link>
  );
}
