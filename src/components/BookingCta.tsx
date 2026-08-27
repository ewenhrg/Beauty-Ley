import { BookingButton } from "./BookingButton";
import { getStoreStatus } from "@/server/db";
import { Reveal } from "./Reveal";
import { getT } from "@/i18n/server";

export async function BookingCta() {
  const t = await getT();
  const online = getStoreStatus().ready;

  return (
    <section className="relative overflow-hidden">
      <picture>
        <source srcSet="/images/salon/pedicure-lounge.webp" type="image/webp" />
        <img
          src="/images/salon/pedicure-lounge.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      </picture>
      <div className="absolute inset-0 bg-linear-to-br from-terracotta/80 via-rose/70 to-gold-deep/70" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/55 to-transparent" />
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -top-16 right-10 h-56 w-56 rounded-full bg-gold/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift-slow pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-cream/20 blur-3xl"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 lg:py-28">
        <Reveal className="text-gradient-light text-[11px] font-semibold tracking-[0.28em] uppercase">
          {t("cta.eyebrow")}
        </Reveal>
        <Reveal as="h2" delay={80} className="font-display mt-5 text-4xl text-cream sm:text-5xl">
          {t("cta.title")}
        </Reveal>
        <Reveal as="p" delay={160} className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-cream/85">
          {online ? t("cta.online") : t("cta.offline")}
        </Reveal>
        <Reveal delay={240} className="mt-10">
          <BookingButton variant="light" />
        </Reveal>
      </div>
    </section>
  );
}
