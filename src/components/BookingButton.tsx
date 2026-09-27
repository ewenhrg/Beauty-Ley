"use client";

import { useT } from "@/i18n/I18nProvider";
import { whatsappBookingUrl } from "@/lib/whatsapp";

type Props = {
  variant?: "solid" | "ghost" | "light";
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

/** Public CTA: opens the salon WhatsApp instead of the online calendar. */
export function BookingButton({ variant = "solid", className = "", children }: Props) {
  const t = useT();
  const styles = VARIANTS[variant];

  return (
    <a
      href={whatsappBookingUrl(t("cta.whatsappMessage"))}
      target="_blank"
      rel="noreferrer"
      className={`${BASE} ${styles} ${className}`}
    >
      {children ?? t("cta.book")}
    </a>
  );
}
