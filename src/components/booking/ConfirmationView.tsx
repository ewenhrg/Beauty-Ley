"use client";

import Link from "next/link";
import type { AppointmentDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import { googleCalendarUrl, icsDataUrl } from "@/lib/calendar-links";
import { formatDateKey, formatDuration } from "@/lib/time";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { intlLocale } from "@/i18n/config";

export function ConfirmationView({ appointment }: { appointment: AppointmentDto }) {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="step-in text-center">
      <ConfirmMark />

      <p className="text-gradient mt-6 text-[11px] font-semibold tracking-[0.28em] uppercase">
        {t("booking.confirm.eyebrow")}
      </p>
      <h2 className="font-display mt-3 text-4xl text-ink sm:text-5xl">
        {t("booking.confirm.heading")}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        {t("booking.confirm.ref", { ref: appointment.reference })}
        {appointment.confirmationSent ? t("booking.confirm.email") : t("booking.confirm.keep")}
      </p>

      <div className="mx-auto mt-10 max-w-md rounded-[1.75rem] border border-line bg-white/60 p-6 text-left sm:p-8">
        <p className="font-display text-2xl text-ink">{appointment.serviceName}</p>
        <p className="mt-1 text-[11px] tracking-[0.18em] text-rose uppercase">
          {t("booking.confirm.with", { name: appointment.staffName })}
        </p>
        <div className="gold-rule mt-5" />
        <dl className="mt-5 space-y-3.5 text-sm">
          <Row label={t("booking.summary.date")} value={formatDateKey(appointment.date, { locale: intlLocale(locale) })} />
          <Row label={t("booking.summary.time")} value={appointment.time} />
          <Row label={t("booking.summary.duration")} value={formatDuration(appointment.duration)} />
          <Row
            label={t("booking.summary.price")}
            value={priceLabel(appointment.price, appointment.priceKind, t("price.from"))}
            emphasis
          />
          <Row label={t("booking.summary.pay")} value={appointment.paymentLabel} />
        </dl>
      </div>

      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
        <a
          href={icsDataUrl(appointment)}
          download={`beauty-ley-${appointment.reference}.ics`}
          className="inline-flex items-center justify-center bg-terracotta px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-cream uppercase shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose hover:shadow-glow"
        >
          {t("booking.confirm.addCal")}
        </a>
        <a
          href={googleCalendarUrl(appointment)}
          target="_blank"
          rel="noreferrer"
          className="nav-link text-[11px] tracking-[0.2em] text-ink-soft uppercase transition-colors hover:text-ink"
        >
          {t("booking.confirm.addGcal")}
        </a>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/rendez-vous/${appointment.reference}?t=${manageToken(appointment)}`}
            className="inline-flex items-center justify-center border border-terracotta/40 px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-ink uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-rose hover:text-rose"
          >
            {t("booking.confirm.manage")}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-line px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-ink-soft uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta/40 hover:text-ink"
          >
            {t("booking.confirm.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

/** The manage link is handed back by the API inside `manageUrl`. */
function manageToken(appointment: AppointmentDto) {
  try {
    return new URL(appointment.manageUrl).searchParams.get("t") ?? "";
  } catch {
    return "";
  }
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[10px] tracking-[0.24em] text-ink-soft uppercase">{label}</dt>
      <dd className={emphasis ? "font-display text-xl text-terracotta" : "text-ink"}>{value}</dd>
    </div>
  );
}

function ConfirmMark() {
  const t = useT();
  return (
    <svg
      viewBox="0 0 80 80"
      className="mx-auto h-20 w-20"
      fill="none"
      role="img"
      aria-label={t("booking.confirm.heading")}
    >
      <circle
        className="confirm-ring"
        cx="40"
        cy="40"
        r="30"
        stroke="var(--color-gold)"
        strokeWidth="2"
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <path
        className="confirm-check"
        d="M27 41.5l9 9 17-19"
        stroke="var(--color-terracotta)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
