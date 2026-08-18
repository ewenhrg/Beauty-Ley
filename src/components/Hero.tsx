import Link from "next/link";
import { BookingButton } from "./BookingButton";
import { salon } from "@/data/salon";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      <picture>
        <source srcSet="/images/hero.webp" type="image/webp" />
        <img
          src="/images/hero.jpg"
          alt="Espace manucure et pédicure de Beauty Ley à Hurghada"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-linear-to-t from-terracotta/80 via-ink/25 to-rose/20" />
      <div className="absolute inset-0 bg-linear-to-r from-ink/35 via-transparent to-gold/15" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-40 lg:pb-24">
        <p className="reveal text-[11px] tracking-[0.32em] text-gold-soft uppercase">
          {salon.city} · {salon.tagline}
        </p>
        <h1 className="reveal font-display mt-5 max-w-3xl text-[18vw] leading-[0.9] font-medium text-cream sm:text-7xl md:text-8xl lg:text-9xl">
          Beauty Ley
        </h1>
        <p className="reveal mt-6 max-w-md text-base leading-relaxed text-cream/90 sm:text-lg">
          Studio de beauté à Hurghada.
        </p>
        <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <BookingButton variant="light" />
          <Link
            href="/prestations"
            className="inline-flex items-center justify-center px-6 py-3 text-[11px] font-medium tracking-[0.22em] text-cream uppercase ring-1 ring-cream/45 transition-colors hover:bg-cream/10"
          >
            Découvrir nos prestations
          </Link>
        </div>
      </div>
    </section>
  );
}
