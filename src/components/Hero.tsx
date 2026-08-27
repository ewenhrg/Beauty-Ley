"use client";

import Link from "next/link";
import { BookingButton } from "./BookingButton";
import { salon } from "@/data/salon";
import { useT } from "@/i18n/I18nProvider";

export function Hero() {
  const t = useT();
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      <picture>
        <source srcSet="/images/hero.webp" type="image/webp" />
        <img
          src="/images/hero.jpg"
          alt={t("hero.alt")}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-linear-to-t from-terracotta/80 via-ink/25 to-rose/20" />
      <div className="absolute inset-0 bg-linear-to-r from-ink/35 via-transparent to-gold/15" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(7.5rem+env(safe-area-inset-top))] sm:px-8 sm:pb-20 sm:pt-40 lg:pb-24">
        <p className="reveal text-[11px] tracking-[0.32em] text-gold-soft uppercase">
          {salon.city} · {salon.tagline}
        </p>
        <h1 className="reveal font-display mt-5 max-w-3xl text-[clamp(2.75rem,12vw,8rem)] leading-[0.9] font-medium text-cream">
          Beauty Ley
        </h1>
        <p className="reveal mt-6 max-w-md text-base leading-relaxed text-cream/90 sm:text-lg">
          {t("hero.lead")}
        </p>
        <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <BookingButton variant="light" className="min-h-12 w-full sm:w-auto" />
          <Link
            href="/prestations"
            className="inline-flex min-h-12 items-center justify-center px-6 py-3 text-[11px] font-medium tracking-[0.22em] text-cream uppercase ring-1 ring-cream/45 transition-colors hover:bg-cream/10"
          >
            {t("hero.discover")}
          </Link>
        </div>
      </div>
    </section>
  );
}
