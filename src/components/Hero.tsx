"use client";

import Image from "next/image";
import { BookingButton } from "./BookingButton";
import { LocalizedLink } from "./LocalizedLink";
import { salon } from "@/data/salon";
import { useT } from "@/i18n/I18nProvider";

/** `kicker` ("Beauty salon in Hurghada", localized) is part of the H1 for search engines. */
export function Hero({ kicker }: { kicker: string }) {
  const t = useT();
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      <Image
        src="/images/hero.jpg"
        alt={t("hero.alt")}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-terracotta/80 via-ink/25 to-rose/20" />
      <div className="absolute inset-0 bg-linear-to-r from-ink/35 via-transparent to-gold/15" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(7.5rem+env(safe-area-inset-top)+var(--promo-banner-h,0px))] sm:px-8 sm:pb-20 sm:pt-[calc(10rem+var(--promo-banner-h,0px))] lg:pb-24">
        <h1>
          <span className="reveal block text-[11px] tracking-[0.32em] text-gold-soft uppercase">
            {kicker} · {salon.tagline}
          </span>
          <span className="reveal-lcp font-display mt-5 block max-w-3xl text-[clamp(2.75rem,12vw,8rem)] leading-[0.9] font-medium text-cream">
            Beauty Ley
          </span>
        </h1>
        <p className="reveal mt-6 max-w-md text-base leading-relaxed text-cream/90 sm:text-lg">
          {t("hero.lead")}
        </p>
        <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <BookingButton variant="light" className="min-h-12 w-full sm:w-auto" />
          <LocalizedLink
            href="/prestations"
            className="inline-flex min-h-12 items-center justify-center px-6 py-3 text-[11px] font-medium tracking-[0.22em] text-cream uppercase ring-1 ring-cream/45 transition-colors hover:bg-cream/10"
          >
            {t("hero.discover")}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
