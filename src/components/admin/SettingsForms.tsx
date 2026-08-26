"use client";

import {
  createClosureAction,
  deleteClosureAction,
  saveBusinessHoursAction,
  saveSettingsAction,
} from "@/app/admin/actions";
import type { BusinessClosureRow, BusinessHoursRow, SettingsRow } from "@/server/db/types";
import { formatDateKey, minutesToLabel, todayKey, weekdayLabel } from "@/lib/time";
import { ActionForm, LabelledField, SubmitButton, adminInput, adminLabel } from "./ui";

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function BusinessHoursForm({ hours }: { hours: BusinessHoursRow[] }) {
  const byWeekday = new Map(hours.map((row) => [row.weekday, row]));

  return (
    <ActionForm action={saveBusinessHoursAction}>
      <div className="space-y-2">
        {WEEK_ORDER.map((weekday) => {
          const row = byWeekday.get(weekday);
          if (!row) return null;
          return (
            <div
              key={weekday}
              className="grid items-center gap-2 rounded-xl border border-line bg-white/60 px-3 py-2.5 sm:grid-cols-[150px_1fr]"
            >
              <input type="hidden" name={`id-${weekday}`} value={row.id} />
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name={`closed-${weekday}`}
                  defaultChecked={row.closed}
                  className="h-4 w-4 accent-[#c17a5c]"
                />
                <span className="w-20 shrink-0">{weekdayLabel(weekday)}</span>
                <span className="text-xs text-ink-soft">fermé</span>
              </label>
              <span className="flex items-center gap-2">
                <input
                  type="time"
                  name={`open-${weekday}`}
                  step={300}
                  defaultValue={minutesToLabel(row.open_min)}
                  className={adminInput}
                  aria-label={`Ouverture ${weekdayLabel(weekday)}`}
                />
                <span aria-hidden="true" className="text-ink-soft">
                  →
                </span>
                <input
                  type="time"
                  name={`close-${weekday}`}
                  step={300}
                  defaultValue={minutesToLabel(row.close_min)}
                  className={adminInput}
                  aria-label={`Fermeture ${weekdayLabel(weekday)}`}
                />
              </span>
            </div>
          );
        })}
      </div>
      <SubmitButton className="mt-4">Enregistrer les horaires</SubmitButton>
    </ActionForm>
  );
}

export function ClosuresForm({ closures }: { closures: BusinessClosureRow[] }) {
  return (
    <div>
      <div className="space-y-2">
        {closures.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-4 text-xs text-ink-soft">
            Aucune fermeture programmée. Ajoutez ici les jours fériés et les congés du studio.
          </p>
        ) : null}
        {closures.map((closure) => (
          <div
            key={closure.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/60 px-4 py-3"
          >
            <div>
              <p className="text-sm text-ink">{closure.label}</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {formatDateKey(closure.start_date)}
                {closure.end_date !== closure.start_date
                  ? ` → ${formatDateKey(closure.end_date, { withYear: true })}`
                  : ""}
              </p>
            </div>
            <ActionForm action={deleteClosureAction}>
              <input type="hidden" name="id" value={closure.id} />
              <SubmitButton variant="ghost">Supprimer</SubmitButton>
            </ActionForm>
          </div>
        ))}
      </div>

      <ActionForm
        action={createClosureAction}
        className="mt-4 rounded-xl border border-dashed border-line bg-white/40 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <LabelledField label="Du">
            <input
              type="date"
              name="startDate"
              required
              defaultValue={todayKey()}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Au">
            <input
              type="date"
              name="endDate"
              required
              defaultValue={todayKey()}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Motif">
            <input name="label" required placeholder="Aïd, congés annuels…" className={adminInput} />
          </LabelledField>
        </div>
        <SubmitButton variant="ghost" className="mt-3">
          Ajouter une fermeture
        </SubmitButton>
      </ActionForm>
    </div>
  );
}

export function BookingSettingsForm({
  settings,
  paymentModes,
  stripeConfigured,
}: {
  settings: SettingsRow;
  paymentModes: SettingsRow["payment_mode"][];
  stripeConfigured: boolean;
}) {
  return (
    <ActionForm action={saveSettingsAction}>
      <div className="grid gap-3 sm:grid-cols-2">
        <LabelledField label="Pas des créneaux (min)">
          <input
            name="granularity"
            type="number"
            min={5}
            max={60}
            step={5}
            defaultValue={settings.slot_granularity_min}
            className={adminInput}
          />
        </LabelledField>
        <LabelledField label="Délai minimum avant RDV (min)">
          <input
            name="minNotice"
            type="number"
            min={0}
            max={10080}
            defaultValue={settings.min_notice_min}
            className={adminInput}
          />
        </LabelledField>
        <LabelledField label="Réservation ouverte sur (jours)">
          <input
            name="maxAdvance"
            type="number"
            min={1}
            max={365}
            defaultValue={settings.max_advance_days}
            className={adminInput}
          />
        </LabelledField>
        <LabelledField label="Annulation gratuite jusqu'à (h)">
          <input
            name="cancellation"
            type="number"
            min={0}
            max={336}
            defaultValue={settings.cancellation_window_hours}
            className={adminInput}
          />
        </LabelledField>
        <LabelledField label="Mode de règlement">
          <select name="paymentMode" defaultValue={settings.payment_mode} className={adminInput}>
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode === "onsite"
                  ? "Paiement sur place"
                  : mode === "deposit"
                    ? "Acompte en ligne"
                    : "Paiement intégral en ligne"}
              </option>
            ))}
          </select>
        </LabelledField>
        <LabelledField label="Acompte (%)">
          <input
            name="depositPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={settings.deposit_percent}
            disabled={!stripeConfigured}
            className={adminInput}
          />
        </LabelledField>
        <LabelledField label="Email du studio">
          <input
            name="salonEmail"
            type="email"
            defaultValue={settings.salon_email ?? ""}
            className={adminInput}
          />
        </LabelledField>
        <LabelledField label="Téléphone du studio">
          <input name="salonPhone" defaultValue={settings.salon_phone ?? ""} className={adminInput} />
        </LabelledField>
        <LabelledField label="Conditions de réservation" className="sm:col-span-2">
          <textarea
            name="terms"
            rows={3}
            required
            defaultValue={settings.booking_terms}
            className={`${adminInput} resize-y`}
          />
        </LabelledField>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            type="checkbox"
            name="autoConfirm"
            defaultChecked={settings.auto_confirm}
            className="h-4 w-4 accent-[#c17a5c]"
          />
          Confirmer automatiquement les réservations en ligne
        </label>
      </div>

      {stripeConfigured ? null : (
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Seul le paiement sur place est disponible : renseignez <code>STRIPE_SECRET_KEY</code> pour
          activer l&apos;acompte et le paiement intégral.
        </p>
      )}

      <SubmitButton className="mt-4">Enregistrer</SubmitButton>
    </ActionForm>
  );
}

export function NotificationStatus({
  channels,
  accounts,
}: {
  channels: {
    email: string | null;
    sms: string | null;
    whatsapp: string | null;
    ntfy: string | null;
    telegram: string | null;
    ntfyTopic: string | null;
    ntfyUrl: string | null;
  };
  accounts: Array<{ name: string; username: string; topic: string; url: string }>;
}) {
  const rows = [
    { label: "Notifs téléphone (par personne)", value: channels.ntfy, hint: "NTFY_TOPIC" },
    { label: "Email clientes", value: channels.email, hint: "RESEND_API_KEY + NOTIFICATION_FROM" },
    { label: "SMS", value: channels.sms, hint: "Aucun fournisseur branché" },
    { label: "WhatsApp", value: channels.whatsapp, hint: "Aucun fournisseur branché" },
  ];

  return (
    <div className="space-y-2">
      <p className={adminLabel}>Canaux de notification</p>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white/60 px-4 py-3"
        >
          <span className="text-sm text-ink">{row.label}</span>
          <span className="text-xs text-ink-soft">
            {row.value ? `Actif · ${row.value}` : `Inactif · ${row.hint}`}
          </span>
        </div>
      ))}

      {channels.ntfy && accounts.length ? (
        <div className="mt-4 rounded-2xl border border-terracotta/30 bg-blush/20 px-4 py-4 text-sm leading-relaxed text-ink">
          <p className="text-[10px] tracking-[0.2em] text-rose uppercase">Un sujet par personne</p>
          <p className="mt-2">
            Personne n&apos;est alerté à la réservation en ligne. La notification part sur le
            téléphone de la personne uniquement quand vous lui attribuez le rendez-vous.
          </p>
          <ul className="mt-3 space-y-2 text-xs">
            {accounts.map((account) => (
              <li key={account.username}>
                <span className="font-medium text-ink">{account.name}</span>
                <span className="text-ink-soft"> · @{account.username} · </span>
                <a
                  href={account.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-terracotta underline"
                >
                  {account.topic}
                </a>
              </li>
            ))}
          </ul>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-ink-soft">
            <li>
              iPhone :{" "}
              <a
                className="underline"
                href="https://apps.apple.com/app/ntfy/id1625396347"
                target="_blank"
                rel="noreferrer"
              >
                App Store
              </a>
              {" · "}
              Android :{" "}
              <a
                className="underline"
                href="https://play.google.com/store/apps/details?id=io.heckel.ntfy"
                target="_blank"
                rel="noreferrer"
              >
                Play Store
              </a>
            </li>
            <li>Ouvrir ntfy → + → s&apos;abonner à SON sujet (ci-dessus)</li>
            <li>Autoriser les notifications du téléphone</li>
          </ol>
        </div>
      ) : channels.ntfyTopic && channels.ntfyUrl ? (
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Créez un compte par personne dans{" "}
          <a href="/admin/comptes" className="text-terracotta underline">
            Comptes
          </a>
          , lié à un membre de l&apos;équipe. Chaque compte a ensuite son propre sujet ntfy.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-ink-soft">
          Pour les alertes téléphone, renseignez <code>NTFY_TOPIC</code>.
        </p>
      )}
    </div>
  );
}
