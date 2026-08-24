import { listOverlapping } from "./repo/appointments";
import { listStaffForService, getService, listStaff, listStaffServices } from "./repo/catalog";
import {
  listBusinessHours,
  listClosures,
  listStaffSchedules,
  listTimeOff,
} from "./repo/schedule";
import { getSettings } from "./repo/settings";
import type { ServiceRow, SettingsRow, StaffRow } from "./db/types";
import {
  addDays,
  diffDays,
  instantToWall,
  minutesToLabel,
  todayKey,
  wallToInstant,
  weekdayOfKey,
} from "@/lib/time";

export type Slot = {
  /** `HH:MM` in salon local time. */
  time: string;
  /** Minutes since local midnight — the stable key for the UI. */
  minutes: number;
  /** UTC instant the appointment would start at. */
  startAt: string;
  /** Staff members free for that slot, in display order. */
  staffIds: string[];
};

export type DayAvailability = {
  date: string;
  /** False when the salon is closed, the team is off, or nothing is left. */
  open: boolean;
  /** Why the day has no slot — shown in the calendar tooltip. */
  reason: "closed" | "off" | "full" | "past" | "out-of-range" | null;
  label: string | null;
  slotCount: number;
};

type Interval = { start: number; end: number };

function subtract(windows: Interval[], busy: Interval[]): Interval[] {
  let result = windows;
  for (const block of busy) {
    const next: Interval[] = [];
    for (const window of result) {
      if (block.end <= window.start || block.start >= window.end) {
        next.push(window);
        continue;
      }
      if (block.start > window.start) next.push({ start: window.start, end: block.start });
      if (block.end < window.end) next.push({ start: block.end, end: window.end });
    }
    result = next;
  }
  return result.filter((window) => window.end > window.start);
}

function intersect(a: Interval, b: Interval): Interval | null {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  return end > start ? { start, end } : null;
}

type Context = {
  settings: SettingsRow;
  service: ServiceRow;
  staff: StaffRow[];
  /** Salon opening window per weekday, in local minutes; null when closed. */
  businessByWeekday: Map<number, Interval | null>;
  closures: Array<{ start: string; end: string; label: string }>;
  schedulesByStaff: Map<string, Array<{ weekday: number; start_min: number; end_min: number }>>;
  timeOffByStaff: Map<string, Interval[]>;
};

async function loadContext(serviceId: string, staffId?: string): Promise<Context | null> {
  const service = await getService(serviceId);
  if (!service || !service.active) return null;

  const [settings, staffForService, hours, closures, schedules, timeOff] = await Promise.all([
    getSettings(),
    listStaffForService(serviceId, { activeOnly: true }),
    listBusinessHours(),
    listClosures(),
    listStaffSchedules(),
    listTimeOff({ from: new Date().toISOString() }),
  ]);

  const staff = staffId
    ? staffForService.filter((member) => member.id === staffId)
    : staffForService;
  if (!staff.length) return null;

  const businessByWeekday = new Map<number, Interval | null>();
  for (const row of hours) {
    businessByWeekday.set(
      row.weekday,
      row.closed ? null : { start: row.open_min, end: row.close_min },
    );
  }

  const schedulesByStaff = new Map<string, Array<{ weekday: number; start_min: number; end_min: number }>>();
  for (const row of schedules) {
    const list = schedulesByStaff.get(row.staff_id) ?? [];
    list.push({ weekday: row.weekday, start_min: row.start_min, end_min: row.end_min });
    schedulesByStaff.set(row.staff_id, list);
  }

  const timeOffByStaff = new Map<string, Interval[]>();
  for (const row of timeOff) {
    const list = timeOffByStaff.get(row.staff_id) ?? [];
    list.push({ start: Date.parse(row.start_at), end: Date.parse(row.end_at) });
    timeOffByStaff.set(row.staff_id, list);
  }

  return {
    settings,
    service,
    staff,
    businessByWeekday,
    closures: closures.map((row) => ({
      start: row.start_date,
      end: row.end_date,
      label: row.label,
    })),
    schedulesByStaff,
    timeOffByStaff,
  };
}

function closureFor(context: Context, dateKey: string) {
  return context.closures.find((closure) => dateKey >= closure.start && dateKey <= closure.end);
}

/** Free intervals (epoch ms) for one staff member on one day. */
async function freeIntervals(
  context: Context,
  member: StaffRow,
  dateKey: string,
  busyByStaff: Map<string, Interval[]>,
): Promise<Interval[]> {
  const weekday = weekdayOfKey(dateKey);
  const business = context.businessByWeekday.get(weekday);
  if (!business) return [];

  const shifts = (context.schedulesByStaff.get(member.id) ?? []).filter(
    (row) => row.weekday === weekday,
  );
  if (!shifts.length) return [];

  const windows: Interval[] = [];
  for (const shift of shifts) {
    const clipped = intersect(
      { start: shift.start_min, end: shift.end_min },
      { start: business.start, end: business.end },
    );
    if (!clipped) continue;
    windows.push({
      start: wallToInstant(dateKey, clipped.start).getTime(),
      end: wallToInstant(dateKey, clipped.end).getTime(),
    });
  }
  if (!windows.length) return [];

  const busy = [
    ...(context.timeOffByStaff.get(member.id) ?? []),
    ...(busyByStaff.get(member.id) ?? []),
  ];
  return subtract(windows, busy);
}

async function loadBusy(dateKey: string, staff: StaffRow[]) {
  const dayStart = wallToInstant(dateKey, 0);
  const dayEnd = wallToInstant(addDays(dateKey, 1), 0);
  const appointments = await listOverlapping(dayStart.toISOString(), dayEnd.toISOString());

  const busyByStaff = new Map<string, Interval[]>();
  const ids = new Set(staff.map((member) => member.id));
  for (const appointment of appointments) {
    if (!ids.has(appointment.staff_id)) continue;
    const list = busyByStaff.get(appointment.staff_id) ?? [];
    list.push({ start: Date.parse(appointment.start_at), end: Date.parse(appointment.end_at) });
    busyByStaff.set(appointment.staff_id, list);
  }
  return busyByStaff;
}

export type SlotsResult = {
  date: string;
  slots: Slot[];
  reason: DayAvailability["reason"];
  label: string | null;
};

/**
 * Computes bookable start times for one service on one day. Always run on the
 * server: it is the only source of truth for what a client may book.
 */
export async function getSlots(
  serviceId: string,
  dateKey: string,
  staffId?: string,
  now: Date = new Date(),
): Promise<SlotsResult> {
  const context = await loadContext(serviceId, staffId);
  if (!context) return { date: dateKey, slots: [], reason: "off", label: null };
  return computeSlots(context, dateKey, now);
}

async function computeSlots(
  context: Context,
  dateKey: string,
  now: Date,
): Promise<SlotsResult> {
  const { settings, service } = context;
  const today = todayKey(now);
  const offset = diffDays(today, dateKey);

  if (offset < 0) return { date: dateKey, slots: [], reason: "past", label: null };
  if (offset > settings.max_advance_days) {
    return { date: dateKey, slots: [], reason: "out-of-range", label: null };
  }

  const closure = closureFor(context, dateKey);
  if (closure) return { date: dateKey, slots: [], reason: "closed", label: closure.label };

  const weekday = weekdayOfKey(dateKey);
  if (!context.businessByWeekday.get(weekday)) {
    return { date: dateKey, slots: [], reason: "closed", label: "Salon fermé" };
  }

  const busyByStaff = await loadBusy(dateKey, context.staff);
  const granularity = Math.max(5, settings.slot_granularity_min) * 60_000;
  const serviceMs = service.duration_min * 60_000;
  const earliest = now.getTime() + settings.min_notice_min * 60_000;
  const dayStart = wallToInstant(dateKey, 0).getTime();

  const byStart = new Map<number, string[]>();
  let anyShift = false;

  for (const member of context.staff) {
    const windows = await freeIntervals(context, member, dateKey, busyByStaff);
    if (windows.length) anyShift = true;

    for (const window of windows) {
      // Align candidate starts to the salon's slot grid, counted from midnight.
      const fromMidnight = window.start - dayStart;
      const aligned = dayStart + Math.ceil(fromMidnight / granularity) * granularity;

      for (let start = aligned; start + serviceMs <= window.end; start += granularity) {
        if (start < earliest) continue;
        const list = byStart.get(start) ?? [];
        list.push(member.id);
        byStart.set(start, list);
      }
    }
  }

  const order = new Map(context.staff.map((member, index) => [member.id, index]));
  const slots: Slot[] = [...byStart.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, staffIds]) => ({
      time: minutesToLabel(Math.round((start - dayStart) / 60_000)),
      minutes: Math.round((start - dayStart) / 60_000),
      startAt: new Date(start).toISOString(),
      staffIds: staffIds.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)),
    }));

  if (!slots.length) {
    return {
      date: dateKey,
      slots,
      reason: anyShift ? "full" : "off",
      label: null,
    };
  }
  return { date: dateKey, slots, reason: null, label: null };
}

/** Day-by-day summary powering the calendar strip. */
export async function getAvailabilityRange(
  serviceId: string,
  fromKey: string,
  days: number,
  staffId?: string,
  now: Date = new Date(),
): Promise<{ days: DayAvailability[]; maxAdvanceDays: number }> {
  const context = await loadContext(serviceId, staffId);
  if (!context) {
    return {
      days: Array.from({ length: days }, (_, index) => ({
        date: addDays(fromKey, index),
        open: false,
        reason: "off" as const,
        label: null,
        slotCount: 0,
      })),
      maxAdvanceDays: 0,
    };
  }

  const result: DayAvailability[] = [];
  for (let index = 0; index < days; index += 1) {
    const dateKey = addDays(fromKey, index);
    const { slots, reason, label } = await computeSlots(context, dateKey, now);
    result.push({
      date: dateKey,
      open: slots.length > 0,
      reason,
      label,
      slotCount: slots.length,
    });
  }
  return { days: result, maxAdvanceDays: context.settings.max_advance_days };
}

/** First upcoming day with at least one slot, used to preselect the calendar. */
export async function findNextOpenDay(
  serviceId: string,
  staffId?: string,
  now: Date = new Date(),
  horizon = 60,
) {
  const context = await loadContext(serviceId, staffId);
  if (!context) return null;
  const start = todayKey(now);
  const limit = Math.min(horizon, context.settings.max_advance_days);
  for (let index = 0; index <= limit; index += 1) {
    const dateKey = addDays(start, index);
    const { slots } = await computeSlots(context, dateKey, now);
    if (slots.length) return dateKey;
  }
  return null;
}

/**
 * Re-validates a slot at write time and resolves which staff member takes it.
 * `preferredStaffId` is undefined for "peu importe".
 */
export async function resolveSlot(
  serviceId: string,
  startAtIso: string,
  preferredStaffId?: string,
  now: Date = new Date(),
): Promise<
  | { ok: true; staffId: string; service: ServiceRow; settings: SettingsRow }
  | { ok: false; reason: "service" | "slot" }
> {
  const context = await loadContext(serviceId, preferredStaffId);
  if (!context) return { ok: false, reason: "service" };

  const startMs = Date.parse(startAtIso);
  if (Number.isNaN(startMs)) return { ok: false, reason: "slot" };

  const { dateKey } = instantToWall(new Date(startMs));
  const { slots } = await computeSlots(context, dateKey, now);
  const slot = slots.find((candidate) => Date.parse(candidate.startAt) === startMs);
  if (!slot || !slot.staffIds.length) return { ok: false, reason: "slot" };

  if (preferredStaffId) {
    if (!slot.staffIds.includes(preferredStaffId)) return { ok: false, reason: "slot" };
    return { ok: true, staffId: preferredStaffId, service: context.service, settings: context.settings };
  }

  // "Peu importe": spread the load rather than always picking the first member.
  const busy = await loadBusy(dateKey, context.staff);
  const chosen = [...slot.staffIds].sort((a, b) => {
    const load = (busy.get(a)?.length ?? 0) - (busy.get(b)?.length ?? 0);
    if (load !== 0) return load;
    return slot.staffIds.indexOf(a) - slot.staffIds.indexOf(b);
  })[0];

  return { ok: true, staffId: chosen, service: context.service, settings: context.settings };
}

/** Services a staff member can perform, keyed for the admin UI. */
export async function staffServiceMap() {
  const [links, staff] = await Promise.all([listStaffServices(), listStaff()]);
  const map = new Map<string, string[]>(staff.map((member) => [member.id, []]));
  for (const link of links) map.get(link.staff_id)?.push(link.service_id);
  return map;
}
