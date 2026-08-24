"use client";

import Link from "next/link";
import type { AppointmentDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import { googleCalendarUrl, icsDataUrl } from "@/lib/calendar-links";
import { formatDateKey, formatDuration } from "@/lib/time";

export function ConfirmationView({ appointment }: { appointment: AppointmentDto }) {
  return (
    <div className="step-in text-center">
      <ConfirmMark />

      <p className="text-gradient mt-6 text-[11px] font-semibold tracking-[0.28em] uppercase">
        Réservation confirmée
      </p>
      <h2 className="font-display mt-3 text-4xl text-ink sm:text-5xl">
        Votre rendez-vous est confirmé
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        Référence <span className="tracking-[0.18em] text-ink">{appointment.reference}</span>
        {appointment.confirmationSent
          ? " — un email de confirmation vient de vous être envoyé."
          : " — conservez ce lien pour retrouver et gérer votre rendez-vous."}
      </p>

      <div className="mx-auto mt-10 max-w-md rounded-[1.75rem] border border-line bg-white/60 p-6 text-left sm:p-8">
        <p className="font-display text-2xl text-ink">{appointment.serviceName}</p>
        <p className="mt-1 text-[11px] tracking-[0.18em] text-rose uppercase">
          avec {appointment.staffName}
        </p>
        <div className="gold-rule mt-5" />
        <dl className="mt-5 space-y-3.5 text-sm">
          <Row label="Date" value={formatDateKey(appointment.date)} />
          <Row label="Heure" value={appointment.time} />
          <Row label="Durée" value={formatDuration(appointment.duration)} />
          <Row
            label="Prix"
            value={priceLabel(appointment.price, appointment.priceKind)}
            emphasis
          />
          <Row label="Règlement" value={appointment.paymentLabel} />
        </dl>
      </div>

      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
        <a
          href={icsDataUrl(appointment)}
          download={`beauty-ley-${appointment.reference}.ics`}
          className="inline-flex items-center justify-center bg-terracotta px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-cream uppercase shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose hover:shadow-glow"
        >
          Ajouter à mon calendrier
        </a>
        <a
          href={googleCalendarUrl(appointment)}
          target="_blank"
          rel="noreferrer"
          className="nav-link text-[11px] tracking-[0.2em] text-ink-soft uppercase transition-colors hover:text-ink"
        >
          Ajouter à Google Agenda
        </a>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/rendez-vous/${appointment.reference}?t=${manageToken(appointment)}`}
            className="inline-flex items-center justify-center border border-terracotta/40 px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-ink uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-rose hover:text-rose"
          >
            Gérer mon rendez-vous
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-line px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-ink-soft uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta/40 hover:text-ink"
          >
            Retour au site
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
  return (
    <svg
      viewBox="0 0 80 80"
      className="mx-auto h-20 w-20"
      fill="none"
      role="img"
      aria-label="Rendez-vous confirmé"
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
