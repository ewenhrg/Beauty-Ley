import { getStore } from "../db";
import type { AppointmentRow, AppointmentStatus } from "../db/types";
import { BLOCKING_STATUSES } from "../db/types";
import { ensureSeeded } from "./bootstrap";

export type AppointmentQuery = {
  /** Inclusive UTC ISO lower bound on `start_at`. */
  from?: string;
  /** Exclusive UTC ISO upper bound on `start_at`. */
  to?: string;
  staffId?: string;
  serviceId?: string;
  customerId?: string;
  status?: AppointmentStatus;
  /** Keeps only the statuses that occupy the calendar. */
  blockingOnly?: boolean;
};

export async function listAppointments(query: AppointmentQuery = {}) {
  await ensureSeeded();
  const rows = await getStore().select("appointments", {
    ...(query.from || query.to
      ? {
          ...(query.from ? { gte: { start_at: query.from } } : {}),
          ...(query.to ? { lt: { start_at: query.to } } : {}),
        }
      : {}),
    ...(query.staffId || query.serviceId || query.customerId || query.status
      ? {
          eq: {
            ...(query.staffId ? { staff_id: query.staffId } : {}),
            ...(query.serviceId ? { service_id: query.serviceId } : {}),
            ...(query.customerId ? { customer_id: query.customerId } : {}),
            ...(query.status ? { status: query.status } : {}),
          },
        }
      : {}),
    order: { column: "start_at" },
  });

  return query.blockingOnly
    ? rows.filter((row) => BLOCKING_STATUSES.includes(row.status))
    : rows;
}

/**
 * Appointments that overlap a window. The upper bound is compared against
 * `start_at` with a generous margin so long services starting before the window
 * are still returned, then filtered precisely on `end_at`.
 */
export async function listOverlapping(
  fromIso: string,
  toIso: string,
  staffId?: string,
): Promise<AppointmentRow[]> {
  const margin = new Date(new Date(fromIso).getTime() - 12 * 60 * 60 * 1000).toISOString();
  const rows = await listAppointments({
    from: margin,
    to: toIso,
    staffId,
    blockingOnly: true,
  });
  return rows.filter((row) => row.end_at > fromIso && row.start_at < toIso);
}

export async function getAppointment(id: string) {
  await ensureSeeded();
  const rows = await getStore().select("appointments", { eq: { id }, limit: 1 });
  return rows[0] ?? null;
}

export async function getAppointmentByReference(reference: string) {
  await ensureSeeded();
  const rows = await getStore().select("appointments", {
    eq: { reference: reference.toUpperCase() },
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function insertAppointment(row: AppointmentRow) {
  const [created] = await getStore().insert("appointments", [row]);
  return created ?? row;
}

export async function updateAppointment(id: string, patch: Partial<AppointmentRow>) {
  return getStore().update("appointments", id, {
    ...patch,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteAppointment(id: string) {
  await getStore().remove("appointments", id);
}
