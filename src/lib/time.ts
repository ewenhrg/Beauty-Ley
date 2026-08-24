/**
 * Time helpers. Everything is stored as UTC ISO instants; everything the salon
 * and its clients see is wall-clock time in the salon timezone (Africa/Cairo,
 * which observes DST). These helpers are the only place that bridges the two.
 */

export const SALON_TZ = "Africa/Cairo";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: SALON_TZ,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

type WallParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function wallParts(instant: Date): WallParts {
  const parts = partsFormatter.formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  // Intl renders midnight as hour "24" in some engines.
  const hour = read("hour") % 24;
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour,
    minute: read("minute"),
    second: read("second"),
  };
}

function offsetMs(instant: Date) {
  const p = wallParts(instant);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - instant.getTime();
}

/** `YYYY-MM-DD` + minutes since midnight (salon wall clock) -> UTC instant. */
export function wallToInstant(dateKey: string, minutes: number): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day, 0, 0, 0) + minutes * 60_000;
  // Two passes settle the DST transition days.
  let ts = target - offsetMs(new Date(target));
  ts = target - offsetMs(new Date(ts));
  return new Date(ts);
}

/** UTC instant -> salon wall clock. */
export function instantToWall(instant: Date) {
  const p = wallParts(instant);
  return {
    dateKey: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
    minutes: p.hour * 60 + p.minute,
    weekday: weekdayOf(instant),
  };
}

/** 0 = Sunday … 6 = Saturday, in salon local time. */
export function weekdayOf(instant: Date): number {
  const p = wallParts(instant);
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
}

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** `YYYY-MM-DD` for "now" in the salon timezone. */
export function todayKey(now: Date = new Date()) {
  return instantToWall(now).dateKey;
}

export function dateKeyFromParts(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Shift a date key by whole days without touching timezones. */
export function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return dateKeyFromParts(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
  );
}

export function diffDays(from: string, to: string) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000,
  );
}

/** Weekday index (0=Sunday) of a bare date key. */
export function weekdayOfKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function minutesToLabel(minutes: number) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function labelToMinutes(label: string) {
  const [hours, minutes] = label.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!rest) return `${hours} h`;
  return `${hours} h ${pad(rest)}`;
}

const WEEKDAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;

const MONTH_LABELS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

export function weekdayLabel(weekday: number, short = false) {
  const label = WEEKDAY_LABELS[weekday] ?? "";
  return short ? label.slice(0, 3) : label;
}

export function monthLabel(month: number) {
  return MONTH_LABELS[month - 1] ?? "";
}

/** "Samedi 29 août" — the format used across the booking flow. */
export function formatDateKey(dateKey: string, options: { withYear?: boolean } = {}) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const base = `${weekdayLabel(weekdayOfKey(dateKey))} ${day} ${monthLabel(month)}`;
  return options.withYear ? `${base} ${year}` : base;
}

export function formatDateKeyShort(dateKey: string) {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${day} ${monthLabel(month).slice(0, 4)}.`;
}
