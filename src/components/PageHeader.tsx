import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/**
 * Top of every inner page. Uses the CSS `.reveal` animation (not the JS
 * <Reveal>) so the title is visible before hydration: it is often the LCP.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden pt-[calc(7.25rem+env(safe-area-inset-top)+var(--promo-banner-h,0px))] pb-14 sm:pt-[calc(9rem+var(--promo-banner-h,0px))] sm:pb-24">
      <Image
        src="/images/salon/nail-bar.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={60}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-terracotta/85 via-rose/55 to-gold-deep/45" />
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -top-10 right-16 h-48 w-48 rounded-full bg-gold/25 blur-3xl"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <h1>
          <span className="reveal text-gradient-light block text-[11px] font-semibold tracking-[0.28em] uppercase">
            {eyebrow}
          </span>
          <span
            className="reveal-lcp font-display mt-4 block text-4xl text-cream sm:text-6xl"
            style={{ "--delay": "80ms" } as CSSProperties}
          >
            {title}
          </span>
        </h1>
        {children ? (
          <div className="reveal mt-5 max-w-xl text-cream/85" style={{ "--delay": "160ms" } as CSSProperties}>
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
