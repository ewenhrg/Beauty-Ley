import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

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
    <header className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24">
      <img
        src="/images/salon/nail-bar.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-terracotta/85 via-rose/55 to-gold-deep/45" />
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -top-10 right-16 h-48 w-48 rounded-full bg-gold/25 blur-3xl"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-gradient-light text-[11px] font-semibold tracking-[0.28em] uppercase">
          {eyebrow}
        </Reveal>
        <Reveal as="h1" delay={80} className="font-display mt-4 text-5xl text-cream sm:text-6xl">
          {title}
        </Reveal>
        {children ? (
          <Reveal delay={160} className="mt-5 max-w-xl text-cream/85">
            {children}
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}
