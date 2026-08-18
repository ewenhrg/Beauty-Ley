"use client";

import type { ButtonHTMLAttributes } from "react";
import { useBooking } from "./BookingProvider";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "light";
};

export function BookingButton({
  variant = "solid",
  className = "",
  children,
  ...props
}: Props) {
  const { openBooking } = useBooking();
  const styles = {
    solid:
      "bg-terracotta text-cream hover:bg-rose shadow-soft hover:shadow-glow",
    ghost:
      "border border-terracotta/40 text-ink hover:border-rose hover:text-rose bg-transparent",
    light:
      "bg-cream text-terracotta hover:bg-white shadow-soft hover:shadow-glow",
  }[variant];

  return (
    <button
      type="button"
      onClick={openBooking}
      className={`inline-flex items-center justify-center px-6 py-3 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] ${styles} ${className}`}
      {...props}
    >
      {children ?? "Prendre rendez-vous"}
    </button>
  );
}
