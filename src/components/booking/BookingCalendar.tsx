"use client";

import type { DayDto } from "@/lib/booking-types";
import { addDays, diffDays, monthLabel, todayKey, weekdayOfKey } from "@/lib/time";
import { Skeleton } from "./ui";

const WEEKDAY_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];

/** Monday-first column index for a date key. */
function columnOf(dateKey: string) {
  return (weekdayOfKey(dateKey) + 6) % 7;
}

function monthStart(dateKey: string) {
  return `${dateKey.slice(0, 7)}-01`;
}

function daysInMonth(dateKey: string) {
  const [year, month] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Range of days the API must be asked for to paint one month. */
export function calendarWindow(monthKey: string) {
  const start = monthStart(monthKey);
  return { from: start, days: daysInMonth(start) };
}

type Props = {
  monthKey: string;
  days: Map<string, DayDto>;
  selected: string | null;
  loading: boolean;
  maxAdvanceDays: number;
  onSelect: (date: string) => void;
  onMonthChange: (monthKey: string) => void;
};

export function BookingCalendar({
  monthKey,
  days,
  selected,
  loading,
  maxAdvanceDays,
  onSelect,
  onMonthChange,
}: Props) {
  const today = todayKey();
  const start = monthStart(monthKey);
  const [year, month] = start.split("-").map(Number);
  const lead = columnOf(start);
  const count = daysInMonth(start);
  const cells = Array.from({ length: lead + count }, (_, index) =>
    index < lead ? null : addDays(start, index - lead),
  );

  const previousMonth = addDays(start, -1).slice(0, 7);
  const nextMonth = addDays(start, count).slice(0, 7);
  const canGoBack = previousMonth >= today.slice(0, 7);
  const canGoForward = diffDays(today, `${nextMonth}-01`) <= maxAdvanceDays;

  return (
    <div className="rounded-[1.75rem] border border-line bg-white/55 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onMonthChange(previousMonth)}
          disabled={!canGoBack}
          aria-label="Mois précédent"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-terracotta hover:text-terracotta disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-soft"
        >
          <Chevron direction="left" />
        </button>
        <p className="font-display text-lg text-ink capitalize">
          {monthLabel(month)} {year}
        </p>
        <button
          type="button"
          onClick={() => onMonthChange(nextMonth)}
          disabled={!canGoForward}
          aria-label="Mois suivant"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-terracotta hover:text-terracotta disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-soft"
        >
          <Chevron direction="right" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_HEADERS.map((label, index) => (
          <span key={index} className="pb-1 text-[10px] tracking-[0.16em] text-ink-soft/70 uppercase">
            {label}
          </span>
        ))}

        {cells.map((dateKey, index) => {
          if (!dateKey) return <span key={`blank-${index}`} />;
          const info = days.get(dateKey);
          const isSelected = dateKey === selected;
          const isToday = dateKey === today;

          if (loading && !info) {
            return <Skeleton key={dateKey} className="mx-auto h-10 w-10 rounded-full" />;
          }

          const available = info?.open ?? false;
          return (
            <button
              key={dateKey}
              type="button"
              disabled={!available}
              aria-pressed={isSelected}
              aria-label={`${dateKey}${available ? "" : " — indisponible"}`}
              onClick={() => onSelect(dateKey)}
              className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-all duration-300 ${
                isSelected
                  ? "bg-terracotta text-cream shadow-glow"
                  : available
                    ? "text-ink hover:-translate-y-0.5 hover:bg-blush/45"
                    : "text-ink-soft/35"
              } ${isToday && !isSelected ? "ring-1 ring-terracotta/45" : ""}`}
            >
              {Number(dateKey.slice(8))}
              {available && !isSelected ? (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-gold" />
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] tracking-[0.14em] text-ink-soft/80 uppercase">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-soft/25" /> Complet ou fermé
        </span>
      </p>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${direction === "left" ? "" : "rotate-180"}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
