import { getStore } from "../db";
import type {
  BusinessClosureRow,
  BusinessHoursRow,
  StaffScheduleRow,
  StaffTimeOffRow,
} from "../db/types";
import { ensureSeeded } from "./bootstrap";

export async function listBusinessHours() {
  await ensureSeeded();
  return getStore().select("business_hours", { order: { column: "weekday" } });
}

export async function updateBusinessHours(id: string, patch: Partial<BusinessHoursRow>) {
  return getStore().update("business_hours", id, patch);
}

export async function listClosures() {
  await ensureSeeded();
  return getStore().select("business_closures", { order: { column: "start_date" } });
}

export async function createClosure(row: BusinessClosureRow) {
  const [created] = await getStore().insert("business_closures", [row]);
  return created ?? row;
}

export async function deleteClosure(id: string) {
  await getStore().remove("business_closures", id);
}

/** One continuous window per weekday: employees work without a midday break. */
function mergeWindowsByWeekday<T extends { weekday: number; start_min: number; end_min: number }>(
  windows: T[],
): T[] {
  const byDay = new Map<number, T>();
  for (const window of windows) {
    const existing = byDay.get(window.weekday);
    if (!existing) {
      byDay.set(window.weekday, { ...window });
      continue;
    }
    existing.start_min = Math.min(existing.start_min, window.start_min);
    existing.end_min = Math.max(existing.end_min, window.end_min);
  }
  return [...byDay.values()];
}

export async function listStaffSchedules(staffId?: string) {
  await ensureSeeded();
  const rows = await getStore().select("staff_schedules", {
    ...(staffId ? { eq: { staff_id: staffId } } : {}),
    order: { column: "start_min" },
  });
  const byStaff = new Map<string, StaffScheduleRow[]>();
  for (const row of rows) {
    const list = byStaff.get(row.staff_id) ?? [];
    list.push(row);
    byStaff.set(row.staff_id, list);
  }
  return [...byStaff.values()].flatMap((list) => mergeWindowsByWeekday(list));
}

/** Replaces a staff member's whole weekly grid in one shot. */
export async function replaceStaffSchedules(
  staffId: string,
  windows: Array<{ weekday: number; start_min: number; end_min: number }>,
) {
  const store = getStore();
  const existing = await store.select("staff_schedules", { eq: { staff_id: staffId } });
  for (const row of existing) await store.remove("staff_schedules", row.id);

  const merged = mergeWindowsByWeekday(windows.filter((window) => window.end_min > window.start_min));
  const rows: StaffScheduleRow[] = merged.map((window) => ({
    id: `sched-${staffId}-${window.weekday}`,
    staff_id: staffId,
    weekday: window.weekday,
    start_min: window.start_min,
    end_min: window.end_min,
  }));
  if (rows.length) await store.insert("staff_schedules", rows);
  return rows;
}

export async function listTimeOff(options: { staffId?: string; from?: string } = {}) {
  await ensureSeeded();
  return getStore().select("staff_time_off", {
    ...(options.staffId ? { eq: { staff_id: options.staffId } } : {}),
    ...(options.from ? { gte: { end_at: options.from } } : {}),
    order: { column: "start_at" },
  });
}

export async function createTimeOff(row: StaffTimeOffRow) {
  const [created] = await getStore().insert("staff_time_off", [row]);
  return created ?? row;
}

export async function deleteTimeOff(id: string) {
  await getStore().remove("staff_time_off", id);
}
