"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { useBooking } from "./BookingProvider";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "light";
  /** Preselects a prestation in the booking flow. */
  serviceId?: string;
};

const VARIANTS = {
  solid: "bg-terracotta text-cream hover:bg-rose shadow-soft hover:shadow-glow",
  ghost: "border border-terracotta/40 text-ink hover:border-rose hover:text-rose bg-transparent",
  light: "bg-cream text-terracotta hover:bg-white shadow-soft hover:shadow-glow",
} as const;

const BASE =
  "inline-flex items-center justify-center px-6 py-3 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]";

/**
 * Opens the booking journey. Falls back to the social-network modal when online
 * booking is not configured, so the button always does something useful.
 */
export function BookingButton({
  variant = "solid",
  className = "",
  serviceId,
  children,
  ...props
}: Props) {
  const { openBooking, online } = useBooking();
  const styles = VARIANTS[variant];
  const label = children ?? "Prendre rendez-vous";

  if (online) {
    return (
      <Link
        href={serviceId ? `/reservation?service=${encodeURIComponent(serviceId)}` : "/reservation"}
        className={`${BASE} ${styles} ${className}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={openBooking}
      className={`${BASE} ${styles} ${className}`}
      {...props}
    >
      {label}
    </button>
  );
}
