"use client";

import { useState } from "react";
import {
  changeStatusAction,
  deleteAppointmentAction,
  moveAppointmentAction,
  resendConfirmationAction,
  updateAppointmentNoteAction,
} from "@/app/admin/actions";
import { APPOINTMENT_STATUSES } from "@/server/db/types";
import type { AppointmentStatus } from "@/server/db/types";
import { formatDateKey, formatDuration } from "@/lib/time";
import {
  ActionForm,
  Money,
  StatusPill,
  SubmitButton,
  adminInput,
  adminLabel,
} from "./ui";
import { useT } from "@/i18n/I18nProvider";
import { statusKey } from "@/i18n/keys";

export type AppointmentView = {
  id: string;
  reference: string;
  status: AppointmentStatus;
  date: string;
  startLabel: string;
  endLabel: string;
  duration: number;
  price: number;
  serviceName: string;
  serviceId: string;
  staffName: string;
  staffId: string;
  staffColor: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerNote: string | null;
  adminNote: string | null;
  source: "online" | "admin";
};

export function AppointmentCard({
  appointment,
  staff,
  compact = false,
}: {
  appointment: AppointmentView;
  staff: Array<{ id: string; name: string }>;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-[1.25rem] border border-line bg-white/70 transition-colors hover:border-terracotta/40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left sm:gap-4 sm:px-5"
      >
        <span
          aria-hidden="true"
          className="mt-1 h-9 w-1 shrink-0 rounded-full"
          style={{ background: appointment.staffColor }}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-display text-lg text-ink">
              {appointment.startLabel}
              <span className="text-ink-soft/60"> – {appointment.endLabel}</span>
            </span>
            <StatusPill status={appointment.status} />
            {compact ? null : (
              <span className="text-[11px] tracking-[0.14em] text-ink-soft/70 uppercase">
                {formatDateKey(appointment.date)}
              </span>
            )}
          </span>
          <span className="mt-1.5 block truncate text-sm text-ink">
            {appointment.customerName} · {appointment.serviceName}
          </span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            {appointment.staffName} · {formatDuration(appointment.duration)} ·{" "}
            <Money value={appointment.price} />
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`mt-2 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="step-in border-t border-line px-4 py-4 sm:px-5">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Detail label="Référence" value={appointment.reference} />
            <Detail
              label="Origine"
              value={appointment.source === "online" ? "Réservation en ligne" : "Créé au studio"}
            />
            <Detail label="Téléphone" value={appointment.customerPhone} />
            <Detail label="Email" value={appointment.customerEmail ?? "—"} />
            {appointment.customerNote ? (
              <div className="sm:col-span-2">
                <Detail label="Note de la cliente" value={appointment.customerNote} />
              </div>
            ) : null}
          </dl>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ActionForm action={changeStatusAction} className="rounded-xl bg-cream/70 p-4">
              <input type="hidden" name="id" value={appointment.id} />
              <span className={adminLabel}>Statut</span>
              <StatusRadios current={appointment.status} />
              <SubmitButton className="mt-3">Mettre à jour</SubmitButton>
            </ActionForm>

            <ActionForm action={moveAppointmentAction} className="rounded-xl bg-cream/70 p-4">
              <input type="hidden" name="id" value={appointment.id} />
              <span className={adminLabel}>Déplacer / attribuer</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label>
                  <span className={adminLabel}>Date</span>
                  <input
                    type="date"
                    name="date"
                    defaultValue={appointment.date}
                    required
                    className={`${adminInput} mt-1.5`}
                  />
                </label>
                <label>
                  <span className={adminLabel}>Heure</span>
                  <input
                    type="time"
                    name="time"
                    defaultValue={appointment.startLabel}
                    step={300}
                    required
                    className={`${adminInput} mt-1.5`}
                  />
                </label>
                <label>
                  <span className={adminLabel}>Professionnelle</span>
                  <select
                    name="staffId"
                    defaultValue={appointment.staffId}
                    className={`${adminInput} mt-1.5`}
                  >
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <SubmitButton className="mt-3">Attribuer et notifier</SubmitButton>
            </ActionForm>
          </div>

          <ActionForm action={updateAppointmentNoteAction} className="mt-4">
            <input type="hidden" name="id" value={appointment.id} />
            <label className="block">
              <span className={adminLabel}>Note interne</span>
              <textarea
                name="adminNote"
                defaultValue={appointment.adminNote ?? ""}
                rows={2}
                className={`${adminInput} mt-1.5 resize-y`}
                placeholder="Visible uniquement par l'équipe."
              />
            </label>
            <SubmitButton variant="ghost" className="mt-3">
              Enregistrer la note
            </SubmitButton>
          </ActionForm>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionForm action={resendConfirmationAction}>
              <input type="hidden" name="id" value={appointment.id} />
              <SubmitButton variant="ghost">Renvoyer la confirmation</SubmitButton>
            </ActionForm>
            <ActionForm action={deleteAppointmentAction}>
              <input type="hidden" name="id" value={appointment.id} />
              <SubmitButton
                variant="danger"
                confirm="Supprimer définitivement ce rendez-vous ? Préférez l'annulation pour garder l'historique."
              >
                Supprimer
              </SubmitButton>
            </ActionForm>
          </div>
        </div>
      ) : null}
    </article>
  );
}

/** Radio group carrying the status value submitted by the buttons above. */
function StatusRadios({ current }: { current: AppointmentStatus }) {
  const t = useT();
  return (
    <fieldset className="mt-3">
      <legend className="sr-only">Nouveau statut</legend>
      <div className="flex flex-wrap gap-2">
        {APPOINTMENT_STATUSES.map((status) => (
          <label
            key={status}
            className="flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-soft"
          >
            <input
              type="radio"
              name="status"
              value={status}
              defaultChecked={status === current}
              className="accent-[#c17a5c]"
            />
            {t(statusKey(status))}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.2em] text-rose uppercase">{label}</dt>
      <dd className="mt-1 break-words text-ink">{value}</dd>
    </div>
  );
}
