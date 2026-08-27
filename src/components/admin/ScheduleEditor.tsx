"use client";

import { createTimeOffAction, deleteTimeOffAction, saveScheduleAction } from "@/app/admin/actions";
import type { StaffScheduleRow, StaffTimeOffRow } from "@/server/db/types";
import { formatDateKey, instantToWall, minutesToLabel, todayKey, weekdayLabel } from "@/lib/time";
import { ActionForm, LabelledField, SubmitButton, adminInput, adminLabel } from "./ui";

/** Monday-first display order over the 0=Sunday storage convention. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function ScheduleEditor({
  staffId,
  schedules,
  timeOff,
}: {
  staffId: string;
  schedules: StaffScheduleRow[];
  timeOff: StaffTimeOffRow[];
}) {
  const byWeekday = new Map<number, StaffScheduleRow[]>();
  for (const row of schedules) {
    const list = byWeekday.get(row.weekday) ?? [];
    list.push(row);
    byWeekday.set(
      row.weekday,
      list.sort((a, b) => a.start_min - b.start_min),
    );
  }

  return (
    <div className="space-y-8">
      <ActionForm action={saveScheduleAction}>
        <input type="hidden" name="staffId" value={staffId} />
        <p className={adminLabel}>Semaine type</p>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          Cochez un jour pour le marquer comme repos. Sinon, indiquez l&apos;heure de début et de
          fin.
        </p>

        <div className="mt-4 space-y-2">
          {WEEK_ORDER.map((weekday) => {
            const windows = byWeekday.get(weekday) ?? [];
            const off = windows.length === 0;
            const start = windows[0]?.start_min;
            const end = windows.length ? windows[windows.length - 1]?.end_min : undefined;
            return (
              <div
                key={weekday}
                className="grid items-center gap-2 rounded-xl border border-line bg-white/60 px-3 py-2.5 sm:grid-cols-[110px_1fr]"
              >
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    name={`off-${weekday}`}
                    defaultChecked={off}
                    className="h-4 w-4 accent-[#c17a5c]"
                  />
                  <span className="w-16 shrink-0">{weekdayLabel(weekday)}</span>
                </label>
                <TimeRange weekday={weekday} start={start} end={end} />
              </div>
            );
          })}
        </div>

        <SubmitButton className="mt-4">Enregistrer le planning</SubmitButton>
      </ActionForm>

      <div>
        <p className={adminLabel}>Congés et indisponibilités</p>
        <div className="mt-3 space-y-2">
          {timeOff.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-4 text-xs text-ink-soft">
              Aucune absence enregistrée.
            </p>
          ) : null}
          {timeOff.map((entry) => {
            const start = instantToWall(new Date(entry.start_at));
            const end = instantToWall(new Date(entry.end_at));
            return (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink">
                    {formatDateKey(start.dateKey)} {minutesToLabel(start.minutes)} →{" "}
                    {formatDateKey(end.dateKey)} {minutesToLabel(end.minutes)}
                  </p>
                  {entry.reason ? (
                    <p className="mt-0.5 text-xs text-ink-soft">{entry.reason}</p>
                  ) : null}
                </div>
                <ActionForm action={deleteTimeOffAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <SubmitButton variant="ghost">Supprimer</SubmitButton>
                </ActionForm>
              </div>
            );
          })}
        </div>

        <ActionForm
          action={createTimeOffAction}
          className="mt-4 rounded-xl border border-dashed border-line bg-white/40 p-4"
        >
          <input type="hidden" name="staffId" value={staffId} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <LabelledField label="Du">
              <input
                type="date"
                name="startDate"
                required
                defaultValue={todayKey()}
                className={adminInput}
              />
            </LabelledField>
            <LabelledField label="À partir de">
              <input type="time" name="startTime" defaultValue="00:00" className={adminInput} />
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
            <LabelledField label="Jusqu'à">
              <input type="time" name="endTime" defaultValue="23:59" className={adminInput} />
            </LabelledField>
            <LabelledField label="Motif" className="sm:col-span-2 lg:col-span-4">
              <input
                name="reason"
                placeholder="Congés, formation, rendez-vous personnel…"
                className={adminInput}
              />
            </LabelledField>
          </div>
          <SubmitButton variant="ghost" className="mt-3">
            Ajouter une indisponibilité
          </SubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}

function TimeRange({
  weekday,
  start,
  end,
}: {
  weekday: number;
  start?: number;
  end?: number;
}) {
  return (
    <span className="flex items-center gap-2">
      <input
        type="time"
        name={`start-${weekday}`}
        step={300}
        defaultValue={start === undefined ? "" : minutesToLabel(start)}
        className={adminInput}
        aria-label={`Début ${weekdayLabel(weekday)}`}
      />
      <span aria-hidden="true" className="text-ink-soft">
        →
      </span>
      <input
        type="time"
        name={`end-${weekday}`}
        step={300}
        defaultValue={end === undefined ? "" : minutesToLabel(end)}
        className={adminInput}
        aria-label={`Fin ${weekdayLabel(weekday)}`}
      />
    </span>
  );
}
