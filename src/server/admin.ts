import type { AppointmentRow, AppointmentStatus, CustomerRow, ServiceRow, StaffRow } from "./db/types";
import { BLOCKING_STATUSES } from "./db/types";
import { listAppointments } from "./repo/appointments";
import { listServices, listStaff } from "./repo/catalog";
import { listCustomers, normalisePhone } from "./repo/customers";
import { addDays, instantToWall, minutesToLabel, todayKey, wallToInstant } from "@/lib/time";

export type AgendaEntry = {
  appointment: AppointmentRow;
  service: ServiceRow | null;
  staff: StaffRow | null;
  customer: CustomerRow | null;
  /** Salon-local values, precomputed so the client never redoes timezone math. */
  date: string;
  startMinutes: number;
  endMinutes: number;
  startLabel: string;
  endLabel: string;
};

export type AgendaFilters = {
  staffId?: string;
  serviceId?: string;
  status?: AppointmentStatus;
  query?: string;
};

/** Joins appointments with their service, staff and customer for a date range. */
export async function loadAgenda(
  fromDate: string,
  toDateExclusive: string,
  filters: AgendaFilters = {},
): Promise<AgendaEntry[]> {
  const from = wallToInstant(fromDate, 0).toISOString();
  const to = wallToInstant(toDateExclusive, 0).toISOString();

  const [appointments, services, staff, customers] = await Promise.all([
    listAppointments({ from, to, staffId: filters.staffId, serviceId: filters.serviceId, status: filters.status }),
    listServices(),
    listStaff(),
    listCustomers(),
  ]);

  const serviceById = new Map(services.map((row) => [row.id, row]));
  const staffById = new Map(staff.map((row) => [row.id, row]));
  const customerById = new Map(customers.map((row) => [row.id, row]));
  const needle = filters.query?.trim().toLowerCase();
  const digits = needle ? normalisePhone(needle) : "";

  return appointments
    .map((appointment) => {
      const start = instantToWall(new Date(appointment.start_at));
      const end = instantToWall(new Date(appointment.end_at));
      const endMinutes = end.dateKey === start.dateKey ? end.minutes : 24 * 60;
      return {
        appointment,
        service: serviceById.get(appointment.service_id) ?? null,
        staff: staffById.get(appointment.staff_id) ?? null,
        customer: customerById.get(appointment.customer_id) ?? null,
        date: start.dateKey,
        startMinutes: start.minutes,
        endMinutes,
        startLabel: minutesToLabel(start.minutes),
        endLabel: minutesToLabel(endMinutes),
      };
    })
    .filter((entry) => {
      if (!needle) return true;
      const haystack = [
        entry.customer?.first_name,
        entry.customer?.last_name,
        entry.customer?.email,
        entry.service?.name,
        entry.staff?.first_name,
        entry.appointment.reference,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (haystack.includes(needle)) return true;
      return (
        digits.length >= 3 &&
        Boolean(entry.customer && normalisePhone(entry.customer.phone).includes(digits))
      );
    });
}

export type DashboardStats = {
  todayCount: number;
  tomorrowCount: number;
  todayRevenue: number;
  weekRevenue: number;
  customerCount: number;
  /** Booked minutes over available minutes for today, as a percentage. */
  occupancy: number;
  pendingCount: number;
  upcoming: AgendaEntry[];
};

export async function dashboardStats(now = new Date()): Promise<DashboardStats> {
  const today = todayKey(now);
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(today, 7);

  const [todayEntries, tomorrowEntries, weekEntries, customers, staff] = await Promise.all([
    loadAgenda(today, tomorrow),
    loadAgenda(tomorrow, addDays(tomorrow, 1)),
    loadAgenda(today, weekEnd),
    listCustomers(),
    listStaff({ activeOnly: true }),
  ]);

  const counted = (entries: AgendaEntry[]) =>
    entries.filter((entry) => BLOCKING_STATUSES.includes(entry.appointment.status));

  const todayBooked = counted(todayEntries);
  const bookedMinutes = todayBooked.reduce(
    (total, entry) => total + entry.appointment.duration_min,
    0,
  );
  // A rough but honest denominator: the team's opening span for the day.
  const capacityMinutes = staff.length * 8 * 60;

  const upcoming = (await loadAgenda(today, addDays(today, 14)))
    .filter(
      (entry) =>
        BLOCKING_STATUSES.includes(entry.appointment.status) &&
        Date.parse(entry.appointment.start_at) >= now.getTime(),
    )
    .slice(0, 8);

  return {
    todayCount: todayBooked.length,
    tomorrowCount: counted(tomorrowEntries).length,
    todayRevenue: todayBooked.reduce((total, entry) => total + entry.appointment.price, 0),
    weekRevenue: counted(weekEntries).reduce(
      (total, entry) => total + entry.appointment.price,
      0,
    ),
    customerCount: customers.length,
    occupancy: capacityMinutes ? Math.round((bookedMinutes / capacityMinutes) * 100) : 0,
    pendingCount: todayEntries.filter((entry) => entry.appointment.status === "PENDING").length,
    upcoming,
  };
}

export type CustomerSummary = {
  customer: CustomerRow;
  appointmentCount: number;
  lastVisit: string | null;
  totalSpent: number;
};

export async function customerSummaries(): Promise<CustomerSummary[]> {
  const [customers, appointments] = await Promise.all([listCustomers(), listAppointments()]);
  const byCustomer = new Map<string, AppointmentRow[]>();
  for (const appointment of appointments) {
    const list = byCustomer.get(appointment.customer_id) ?? [];
    list.push(appointment);
    byCustomer.set(appointment.customer_id, list);
  }

  return customers
    .map((customer) => {
      const list = byCustomer.get(customer.id) ?? [];
      const honoured = list.filter((row) => row.status === "COMPLETED");
      const past = list
        .filter((row) => row.status !== "CANCELLED")
        .sort((a, b) => (a.start_at < b.start_at ? 1 : -1));
      return {
        customer,
        appointmentCount: list.filter((row) => row.status !== "CANCELLED").length,
        lastVisit: past[0]?.start_at ?? null,
        totalSpent: honoured.reduce((total, row) => total + row.price, 0),
      };
    })
    .sort((a, b) => (a.lastVisit ?? "") < (b.lastVisit ?? "") ? 1 : -1);
}

export type SearchResults = {
  customers: CustomerSummary[];
  appointments: AgendaEntry[];
  services: ServiceRow[];
};

/** Global admin search across clients, appointments and the catalogue. */
export async function globalSearch(query: string): Promise<SearchResults> {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return { customers: [], appointments: [], services: [] };
  const digits = normalisePhone(needle);

  const [summaries, services] = await Promise.all([customerSummaries(), listServices()]);

  const customers = summaries.filter(({ customer }) => {
    const haystack =
      `${customer.first_name} ${customer.last_name} ${customer.email ?? ""}`.toLowerCase();
    if (haystack.includes(needle)) return true;
    return digits.length >= 3 && normalisePhone(customer.phone).includes(digits);
  });

  const today = todayKey();
  const appointments = await loadAgenda(addDays(today, -365), addDays(today, 365), {
    query: needle,
  });

  return {
    customers: customers.slice(0, 12),
    appointments: appointments.slice(0, 20),
    services: services
      .filter((service) => service.name.toLowerCase().includes(needle))
      .slice(0, 12),
  };
}

export async function customerHistory(customerId: string) {
  const entries = await loadAgenda(addDays(todayKey(), -730), addDays(todayKey(), 365));
  return entries
    .filter((entry) => entry.appointment.customer_id === customerId)
    .sort((a, b) => (a.appointment.start_at < b.appointment.start_at ? 1 : -1));
}
