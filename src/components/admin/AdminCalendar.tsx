"use client";

import Link from "next/link";
import { useState } from "react";
import type { AppointmentView } from "./AppointmentCard";
import { AppointmentCard } from "./AppointmentCard";
import { EmptyState } from "./ui";
import { formatDateKey, minutesToLabel, weekdayLabel, weekdayOfKey } from "@/lib/time";

export type CalendarView = "jour" | "semaine" | "mois";

export type CalendarBlock = AppointmentView & { startMinutes: number; endMinutes: number };

type Props = {
  view: CalendarView;
  /** Anchor date of the current view. */
  date: string;
  days: string[];
  blocks: CalendarBlock[];
  staff: Array<{ id: string; name: string; color: string }>;
  staffFilter: string | null;
  /** Grid bounds in minutes, from the salon opening hours. */
  gridStart: number;
  gridEnd: number;
};

const HOUR_HEIGHT = 68;

export function AdminCalendar({
  view,
  date,
  days,
  blocks,
  staff,
  staffFilter,
  gridStart,
  gridEnd,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedBlock = blocks.find((block) => block.id === selected) ?? null;
  const staffOptions = staff.map((member) => ({ id: member.id, name: member.name }));

  return (
    <div>
      {view === "mois" ? (
        <MonthGrid date={date} days={days} blocks={blocks} onSelect={setSelected} />
      ) : (
        <TimeGrid
          view={view}
          days={days}
          blocks={blocks}
          staff={staff}
          staffFilter={staffFilter}
          gridStart={gridStart}
          gridEnd={gridEnd}
          onSelect={setSelected}
        />
      )}

      {selectedBlock ? (
        <div className="step-in mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] text-rose uppercase">Détail</p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-[10px] tracking-[0.18em] text-ink-soft uppercase hover:text-ink"
            >
              Fermer
            </button>
          </div>
          <AppointmentCard appointment={selectedBlock} staff={staffOptions} />
        </div>
      ) : null}
    </div>
  );
}

function TimeGrid({
  view,
  days,
  blocks,
  staff,
  staffFilter,
  gridStart,
  gridEnd,
  onSelect,
}: Omit<Props, "date"> & { onSelect: (id: string) => void }) {
  const totalMinutes = Math.max(gridEnd - gridStart, 60);
  const height = (totalMinutes / 60) * HOUR_HEIGHT;
  const hours: number[] = [];
  for (let minute = Math.ceil(gridStart / 60) * 60; minute <= gridEnd; minute += 60) {
    hours.push(minute);
  }

  // Day view splits by staff member; week view splits by day.
  const columns =
    view === "jour"
      ? staff
          .filter((member) => !staffFilter || member.id === staffFilter)
          .map((member) => ({ key: member.id, label: member.name, accent: member.color }))
      : days.map((day) => ({
          key: day,
          label: `${weekdayLabel(weekdayOfKey(day), true)} ${Number(day.slice(8))}`,
          accent: null,
        }));

  if (!columns.length) return <EmptyState>Aucune professionnelle active.</EmptyState>;

  const blocksFor = (columnKey: string) =>
    view === "jour"
      ? blocks.filter((block) => block.staffId === columnKey && block.date === days[0])
      : blocks.filter((block) => block.date === columnKey);

  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-line bg-white/60">
      <div className="min-w-[640px]">
        <div
          className="grid border-b border-line"
          style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(120px, 1fr))` }}
        >
          <span />
          {columns.map((column) => (
            <span
              key={column.key}
              className="flex items-center gap-2 border-l border-line px-3 py-3 text-[11px] tracking-[0.14em] text-ink uppercase"
            >
              {column.accent ? (
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: column.accent }}
                />
              ) : null}
              {column.label}
            </span>
          ))}
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(120px, 1fr))` }}
        >
          <div className="relative" style={{ height }}>
            {hours.map((minute) => (
              <span
                key={minute}
                className="absolute right-2 -translate-y-1/2 text-[10px] text-ink-soft/70"
                style={{ top: ((minute - gridStart) / 60) * HOUR_HEIGHT }}
              >
                {minutesToLabel(minute)}
              </span>
            ))}
          </div>

          {columns.map((column) => (
            <div
              key={column.key}
              className="relative border-l border-line"
              style={{ height }}
            >
              {hours.map((minute) => (
                <span
                  key={minute}
                  aria-hidden="true"
                  className="absolute inset-x-0 border-t border-line/60"
                  style={{ top: ((minute - gridStart) / 60) * HOUR_HEIGHT }}
                />
              ))}

              {blocksFor(column.key).map((block) => {
                const top = ((block.startMinutes - gridStart) / 60) * HOUR_HEIGHT;
                const blockHeight = Math.max(
                  ((block.endMinutes - block.startMinutes) / 60) * HOUR_HEIGHT - 3,
                  26,
                );
                const cancelled = block.status === "CANCELLED";
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => onSelect(block.id)}
                    className={`absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-transform duration-200 hover:z-10 hover:-translate-y-0.5 ${
                      cancelled ? "opacity-45" : ""
                    }`}
                    style={{
                      top,
                      height: blockHeight,
                      background: `color-mix(in srgb, ${block.staffColor} 16%, #fff8f3)`,
                      borderColor: `color-mix(in srgb, ${block.staffColor} 45%, transparent)`,
                    }}
                  >
                    <span className="block truncate text-[11px] font-medium text-ink">
                      {block.startLabel} {block.customerName}
                    </span>
                    <span className="block truncate text-[10px] text-ink-soft">
                      {block.serviceName}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthGrid({
  date,
  days,
  blocks,
  onSelect,
}: {
  date: string;
  days: string[];
  blocks: CalendarBlock[];
  onSelect: (id: string) => void;
}) {
  const lead = (weekdayOfKey(days[0]) + 6) % 7;
  const cells = [...Array.from({ length: lead }, () => null), ...days];
  const byDay = new Map<string, CalendarBlock[]>();
  for (const block of blocks) {
    const list = byDay.get(block.date) ?? [];
    list.push(block);
    byDay.set(block.date, list);
  }

  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-line bg-white/60 p-3 sm:p-4">
      <div className="grid min-w-[640px] grid-cols-7 gap-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label) => (
          <span
            key={label}
            className="pb-1 text-center text-[10px] tracking-[0.16em] text-ink-soft/70 uppercase"
          >
            {label}
          </span>
        ))}

        {cells.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;
          const list = (byDay.get(day) ?? []).sort((a, b) => a.startMinutes - b.startMinutes);
          return (
            <div
              key={day}
              className="min-h-24 rounded-xl border border-line bg-cream/50 p-2"
            >
              <Link
                href={`/admin/calendrier?view=jour&date=${day}`}
                className="text-[11px] text-ink-soft hover:text-terracotta"
              >
                {Number(day.slice(8))}
              </Link>
              <div className="mt-1.5 space-y-1">
                {list.slice(0, 3).map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => onSelect(block.id)}
                    className="block w-full truncate rounded px-1.5 py-1 text-left text-[10px] transition-colors hover:brightness-95"
                    style={{
                      background: `color-mix(in srgb, ${block.staffColor} 18%, #fff8f3)`,
                    }}
                  >
                    {block.startLabel} {block.customerName}
                  </button>
                ))}
                {list.length > 3 ? (
                  <Link
                    href={`/admin/calendrier?view=jour&date=${day}`}
                    className="block px-1.5 text-[10px] text-ink-soft hover:text-terracotta"
                  >
                    +{list.length - 3} autres
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="sr-only">{formatDateKey(date)}</p>
    </div>
  );
}

/** Compact upcoming list used on narrow screens under the day view. */
export function AgendaList({
  blocks,
  staff,
}: {
  blocks: CalendarBlock[];
  staff: Array<{ id: string; name: string }>;
}) {
  if (!blocks.length) return <EmptyState>Aucun rendez-vous sur cette période.</EmptyState>;
  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <AppointmentCard key={block.id} appointment={block} staff={staff} />
      ))}
    </div>
  );
}
