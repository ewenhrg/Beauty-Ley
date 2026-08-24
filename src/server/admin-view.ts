import type { AppointmentView } from "@/components/admin/AppointmentCard";
import type { AgendaEntry } from "./admin";
import { staffDisplayName } from "./repo/catalog";

/** Flattens an agenda entry into the shape the admin client components use. */
export function toAppointmentView(entry: AgendaEntry): AppointmentView {
  const { appointment, service, staff, customer } = entry;
  return {
    id: appointment.id,
    reference: appointment.reference,
    status: appointment.status,
    date: entry.date,
    startLabel: entry.startLabel,
    endLabel: entry.endLabel,
    duration: appointment.duration_min,
    price: appointment.price,
    serviceName: service?.name ?? "Prestation supprimée",
    serviceId: appointment.service_id,
    staffName: staff ? staffDisplayName(staff) : "—",
    staffId: appointment.staff_id,
    staffColor: staff?.color ?? "#c17a5c",
    customerId: appointment.customer_id,
    customerName: customer ? `${customer.first_name} ${customer.last_name}`.trim() : "—",
    customerPhone: customer?.phone ?? "—",
    customerEmail: customer?.email ?? null,
    customerNote: appointment.customer_note,
    adminNote: appointment.admin_note,
    source: appointment.source,
  };
}
