"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookingApiError,
  cancelAppointment,
  fetchCatalog,
  rescheduleAppointment,
} from "@/lib/booking-client";
import type { AppointmentDto, CatalogDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import { googleCalendarUrl, icsDataUrl } from "@/lib/calendar-links";
import { formatDateKey, formatDuration } from "@/lib/time";
import { DateTimeStep } from "./DateTimeStep";
import { ActionButton, Notice, Skeleton, SummaryRow } from "./ui";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { statusKey } from "@/i18n/keys";
import { intlLocale } from "@/i18n/config";

export function ManageAppointment({
  appointment: initial,
  token,
  cancellationWindowHours,
}: {
  appointment: AppointmentDto;
  token: string;
  cancellationWindowHours: number;
}) {
  const t = useT();
  const locale = useLocale();
  const [appointment, setAppointment] = useState(initial);
  const [mode, setMode] = useState<"view" | "reschedule" | "confirm-cancel">("view");
  const [catalog, setCatalog] = useState<CatalogDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "reschedule" || catalog) return;
    const controller = new AbortController();
    fetchCatalog(controller.signal)
      .then(setCatalog)
      .catch(() => setError("Impossible de charger les créneaux."));
    return () => controller.abort();
  }, [mode, catalog]);

  const cancelled = appointment.status === "CANCELLED";
  const service = catalog?.services.find((item) => item.id === appointment.serviceId) ?? null;

  async function runCancel() {
    setBusy(true);
    setError(null);
    try {
      const updated = await cancelAppointment(appointment.reference, token);
      setAppointment(updated);
      setMode("view");
      setSuccess("Votre rendez-vous a bien été annulé.");
    } catch (caught) {
      setError(caught instanceof BookingApiError ? caught.message : "Annulation impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function runReschedule() {
    if (!startAt) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await rescheduleAppointment(appointment.reference, token, startAt);
      setAppointment(updated);
      setMode("view");
      setStartAt(null);
      setSuccess("Votre rendez-vous a bien été déplacé.");
    } catch (caught) {
      setError(
        caught instanceof BookingApiError ? caught.message : "Déplacement impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`rounded-full px-3.5 py-1.5 text-[10px] tracking-[0.2em] uppercase ${
            cancelled
              ? "bg-ink/10 text-ink-soft"
              : "bg-terracotta text-cream"
          }`}
        >
          {t(statusKey(appointment.status))}
        </span>
        <span className="text-[11px] tracking-[0.18em] text-ink-soft uppercase">
          Réf. {appointment.reference}
        </span>
      </div>

      {success ? (
        <div className="mt-5">
          <Notice tone="success">{success}</Notice>
        </div>
      ) : null}
      {error ? (
        <div className="mt-5">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}

      <dl className="mt-6 rounded-[1.75rem] border border-line bg-white/60 px-5 py-2 sm:px-7">
        <SummaryRow label="Prestation" value={appointment.serviceName} />
        <SummaryRow label="Professionnelle" value={appointment.staffName} />
        <SummaryRow
          label={t("booking.summary.date")}
          value={formatDateKey(appointment.date, { withYear: true, locale: intlLocale(locale) })}
        />
        <SummaryRow label="Heure" value={appointment.time} />
        <SummaryRow label="Durée" value={formatDuration(appointment.duration)} />
        <SummaryRow
          label="Prix"
          value={
            <span className="font-display text-xl text-terracotta">
              {priceLabel(appointment.price, appointment.priceKind)}
            </span>
          }
        />
        {appointment.note ? <SummaryRow label="Votre note" value={appointment.note} /> : null}
      </dl>

      {cancelled ? (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/reservation"
            className="inline-flex items-center justify-center bg-terracotta px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-cream uppercase shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose"
          >
            Reprendre rendez-vous
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-line px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-ink-soft uppercase transition-all duration-300 hover:-translate-y-0.5 hover:text-ink"
          >
            Retour au site
          </Link>
        </div>
      ) : mode === "view" ? (
        <>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={icsDataUrl(appointment)}
              download={`beauty-ley-${appointment.reference}.ics`}
              className="inline-flex items-center justify-center bg-terracotta px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] text-cream uppercase shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose"
            >
              Ajouter à mon calendrier
            </a>
            <ActionButton variant="ghost" onClick={() => setMode("reschedule")}>
              Modifier mon rendez-vous
            </ActionButton>
            <ActionButton
              variant="quiet"
              onClick={() => setMode("confirm-cancel")}
              disabled={!appointment.canCancel}
            >
              Annuler mon rendez-vous
            </ActionButton>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-soft">
            {appointment.canCancel
              ? `Annulation et modification gratuites jusqu'à ${cancellationWindowHours} h avant le rendez-vous.`
              : `Le délai d'annulation en ligne (${cancellationWindowHours} h avant) est dépassé. Contactez directement le studio.`}
          </p>

          <a
            href={googleCalendarUrl(appointment)}
            target="_blank"
            rel="noreferrer"
            className="nav-link mt-4 inline-block text-[11px] tracking-[0.2em] text-ink-soft uppercase hover:text-ink"
          >
            Ajouter à Google Agenda
          </a>
        </>
      ) : mode === "confirm-cancel" ? (
        <div className="mt-8 rounded-[1.75rem] border border-rose/40 bg-rose/10 p-6">
          <p className="font-display text-2xl text-ink">Annuler ce rendez-vous ?</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Le créneau sera immédiatement libéré pour d&apos;autres clientes. Cette action est
            définitive.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ActionButton onClick={runCancel} loading={busy}>
              Confirmer l&apos;annulation
            </ActionButton>
            <ActionButton variant="quiet" onClick={() => setMode("view")} disabled={busy}>
              Garder mon rendez-vous
            </ActionButton>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          {!service ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-64 w-full rounded-[1.75rem]" />
            </div>
          ) : (
            <>
              <DateTimeStep
                service={service}
                staffId={appointment.staffId}
                staff={catalog?.staff ?? []}
                date={date}
                startAt={startAt}
                revision={0}
                onSelectDate={(next) => {
                  setDate(next);
                  setStartAt(null);
                }}
                onSelectSlot={(slot) => setStartAt(slot.startAt)}
              />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ActionButton onClick={runReschedule} loading={busy} disabled={!startAt}>
                  Déplacer mon rendez-vous
                </ActionButton>
                <ActionButton variant="quiet" onClick={() => setMode("view")} disabled={busy}>
                  Annuler la modification
                </ActionButton>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
