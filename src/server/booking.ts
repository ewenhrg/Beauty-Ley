import { resolveSlot } from "./availability";
import { getStore, SupabaseError } from "./db";
import type { AppointmentRow, AppointmentStatus, CustomerRow } from "./db/types";
import { newId, newReference, newToken } from "./ids";
import { notifyAppointment } from "./notifications";
import { planFor } from "./payments";
import {
  getAppointment,
  getAppointmentByReference,
  insertAppointment,
  listOverlapping,
  updateAppointment,
} from "./repo/appointments";
import { getService, getStaff, staffDisplayName } from "./repo/catalog";
import { getCustomer, upsertCustomer } from "./repo/customers";
import { getSettings } from "./repo/settings";
import { getSiteUrl } from "@/lib/site";

export type BookingErrorCode =
  | "SERVICE_UNAVAILABLE"
  | "SLOT_TAKEN"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "TOO_LATE"
  | "ALREADY_CANCELLED";

export class BookingError extends Error {
  constructor(
    readonly code: BookingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

export type BookingInput = {
  serviceId: string;
  /** Undefined means "peu importe" — the engine picks an available member. */
  staffId?: string;
  startAt: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    note: string | null;
  };
  source?: "online" | "admin";
  /** Admin bookings may be created with a status other than the default. */
  status?: AppointmentStatus;
};

export function manageUrl(appointment: Pick<AppointmentRow, "reference" | "manage_token">) {
  return `${getSiteUrl()}/rendez-vous/${appointment.reference}?t=${appointment.manage_token}`;
}

/** Belt-and-braces overlap check run inside the write path. */
async function assertFree(staffId: string, startIso: string, endIso: string, ignoreId?: string) {
  const clashes = await listOverlapping(startIso, endIso, staffId);
  const blocking = clashes.filter((row) => row.id !== ignoreId);
  if (blocking.length) {
    throw new BookingError("SLOT_TAKEN", "Ce créneau vient d'être réservé.");
  }
}

export async function createBooking(input: BookingInput) {
  const store = getStore();

  return store.transaction(async () => {
    const resolved = await resolveSlot(input.serviceId, input.startAt, input.staffId);
    if (!resolved.ok) {
      throw resolved.reason === "service"
        ? new BookingError("SERVICE_UNAVAILABLE", "Cette prestation n'est plus disponible.")
        : new BookingError("SLOT_TAKEN", "Ce créneau vient d'être réservé.");
    }

    const { service, settings, staffId } = resolved;
    const startAt = new Date(input.startAt).toISOString();
    const endAt = new Date(
      Date.parse(startAt) + (service.duration_min + service.buffer_min) * 60_000,
    ).toISOString();

    await assertFree(staffId, startAt, endAt);

    const customer = await upsertCustomer({
      first_name: input.customer.firstName,
      last_name: input.customer.lastName,
      phone: input.customer.phone,
      email: input.customer.email,
    });

    const plan = planFor(service.price, settings);
    const source = input.source ?? "online";
    const row: AppointmentRow = {
      id: newId("apt"),
      reference: newReference(),
      manage_token: newToken(),
      customer_id: customer.id,
      staff_id: staffId,
      service_id: service.id,
      start_at: startAt,
      end_at: endAt,
      duration_min: service.duration_min,
      buffer_min: service.buffer_min,
      status: input.status ?? (settings.auto_confirm || source === "admin" ? "CONFIRMED" : "PENDING"),
      // Price is resolved from the catalogue, never from the browser payload.
      price: service.price,
      customer_note: input.customer.note,
      admin_note: null,
      source,
      payment_status: plan.amountDue > 0 ? "PENDING" : "NONE",
      deposit_amount: plan.amountDue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cancelled_at: null,
      cancelled_by: null,
    };

    try {
      const appointment = await insertAppointment(row);
      return { appointment, customer };
    } catch (error) {
      if (error instanceof SupabaseError && error.isConflict) {
        throw new BookingError("SLOT_TAKEN", "Ce créneau vient d'être réservé.");
      }
      throw error;
    }
  });
}

/** Full payload used by the confirmation page and the client-facing view. */
export async function describeAppointment(appointment: AppointmentRow) {
  const [service, staff, customer, settings] = await Promise.all([
    getService(appointment.service_id),
    getStaff(appointment.staff_id),
    getCustomer(appointment.customer_id),
    getSettings(),
  ]);
  return { appointment, service, staff, customer, settings };
}

async function notificationContext(appointment: AppointmentRow) {
  const { service, staff, customer, settings } = await describeAppointment(appointment);
  if (!service || !staff || !customer) return null;
  return {
    appointment,
    customer,
    service,
    staff,
    manageUrl: manageUrl(appointment),
    cancellationWindowHours: settings.cancellation_window_hours,
  };
}

export async function sendAppointmentEmail(
  kind: "confirmation" | "reminder" | "reschedule" | "cancellation",
  appointment: AppointmentRow,
) {
  const context = await notificationContext(appointment);
  if (!context) return null;
  return notifyAppointment(kind, context);
}

export async function loadForCustomer(reference: string, token: string) {
  const appointment = await getAppointmentByReference(reference);
  if (!appointment) throw new BookingError("NOT_FOUND", "Rendez-vous introuvable.");
  if (appointment.manage_token !== token) {
    throw new BookingError("FORBIDDEN", "Lien de gestion invalide.");
  }
  return appointment;
}

export function cancellationDeadline(appointment: AppointmentRow, windowHours: number) {
  return new Date(Date.parse(appointment.start_at) - windowHours * 3_600_000);
}

export async function cancelBooking(options: {
  appointment: AppointmentRow;
  by: "customer" | "salon";
  now?: Date;
}) {
  const { appointment, by, now = new Date() } = options;
  if (appointment.status === "CANCELLED") {
    throw new BookingError("ALREADY_CANCELLED", "Ce rendez-vous est déjà annulé.");
  }

  if (by === "customer") {
    const settings = await getSettings();
    if (now > cancellationDeadline(appointment, settings.cancellation_window_hours)) {
      throw new BookingError(
        "TOO_LATE",
        `Le délai d'annulation en ligne (${settings.cancellation_window_hours} h avant) est dépassé. Contactez le studio.`,
      );
    }
  }

  const updated = await updateAppointment(appointment.id, {
    status: "CANCELLED",
    cancelled_at: now.toISOString(),
    cancelled_by: by,
  });
  if (!updated) throw new BookingError("NOT_FOUND", "Rendez-vous introuvable.");
  await sendAppointmentEmail("cancellation", updated);
  return updated;
}

export async function rescheduleBooking(options: {
  appointment: AppointmentRow;
  startAt: string;
  staffId?: string;
  by: "customer" | "salon";
}) {
  const { appointment, startAt, staffId, by } = options;
  if (appointment.status === "CANCELLED") {
    throw new BookingError("ALREADY_CANCELLED", "Ce rendez-vous est annulé.");
  }
  const store = getStore();

  return store.transaction(async () => {
    const resolved = await resolveSlot(appointment.service_id, startAt, staffId);
    if (!resolved.ok) {
      throw resolved.reason === "service"
        ? new BookingError("SERVICE_UNAVAILABLE", "Cette prestation n'est plus disponible.")
        : new BookingError("SLOT_TAKEN", "Ce créneau vient d'être réservé.");
    }

    const { service } = resolved;
    const nextStart = new Date(startAt).toISOString();
    const nextEnd = new Date(
      Date.parse(nextStart) + (service.duration_min + service.buffer_min) * 60_000,
    ).toISOString();

    await assertFree(resolved.staffId, nextStart, nextEnd, appointment.id);

    const updated = await updateAppointment(appointment.id, {
      staff_id: resolved.staffId,
      start_at: nextStart,
      end_at: nextEnd,
      duration_min: service.duration_min,
      buffer_min: service.buffer_min,
    });
    if (!updated) throw new BookingError("NOT_FOUND", "Rendez-vous introuvable.");
    if (by === "customer" || by === "salon") await sendAppointmentEmail("reschedule", updated);
    return updated;
  });
}

/**
 * Moves an appointment from the admin calendar. Unlike `rescheduleBooking`, the
 * staff member can change and the slot does not have to sit on the public grid —
 * but overlaps are still refused.
 */
export async function moveAppointment(options: {
  appointmentId: string;
  startAt: string;
  staffId?: string;
}) {
  const store = getStore();
  return store.transaction(async () => {
    const appointment = await getAppointment(options.appointmentId);
    if (!appointment) throw new BookingError("NOT_FOUND", "Rendez-vous introuvable.");

    const staffId = options.staffId ?? appointment.staff_id;
    const nextStart = new Date(options.startAt).toISOString();
    const nextEnd = new Date(
      Date.parse(nextStart) + (appointment.duration_min + appointment.buffer_min) * 60_000,
    ).toISOString();

    await assertFree(staffId, nextStart, nextEnd, appointment.id);

    const updated = await updateAppointment(appointment.id, {
      staff_id: staffId,
      start_at: nextStart,
      end_at: nextEnd,
    });
    if (!updated) throw new BookingError("NOT_FOUND", "Rendez-vous introuvable.");
    return updated;
  });
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus) {
  const appointment = await getAppointment(id);
  if (!appointment) throw new BookingError("NOT_FOUND", "Rendez-vous introuvable.");
  if (status === "CANCELLED") {
    return cancelBooking({ appointment, by: "salon" });
  }
  const updated = await updateAppointment(id, {
    status,
    cancelled_at: null,
    cancelled_by: null,
  });
  if (!updated) throw new BookingError("NOT_FOUND", "Rendez-vous introuvable.");
  return updated;
}

export function customerDisplayName(customer: Pick<CustomerRow, "first_name" | "last_name">) {
  return `${customer.first_name} ${customer.last_name}`.trim();
}

export { staffDisplayName };
