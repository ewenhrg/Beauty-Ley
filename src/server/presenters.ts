import type {
  AppointmentDto,
  CatalogDto,
  CategoryDto,
  ServiceDto,
  StaffDto,
} from "@/lib/booking-types";
import { initialsOf } from "@/lib/booking-types";
import { cancellationDeadline, manageUrl } from "./booking";
import type {
  AppointmentRow,
  CustomerRow,
  ServiceCategoryRow,
  ServiceRow,
  SettingsRow,
  StaffRow,
} from "./db/types";
import { planFor } from "./payments";
import { listCategories, listServices, listStaff, listStaffServices, staffDisplayName } from "./repo/catalog";
import { getSettings } from "./repo/settings";
import { formatDateKey, instantToWall, minutesToLabel } from "@/lib/time";

export function toCategoryDto(row: ServiceCategoryRow): CategoryDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
  };
}

export function toServiceDto(row: ServiceRow, staffIds: string[]): ServiceDto {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    duration: row.duration_min,
    price: row.price,
    priceKind: row.price_kind,
    image: row.image,
    staffIds,
  };
}

export function toStaffDto(row: StaffRow): StaffDto {
  const name = staffDisplayName(row);
  return {
    id: row.id,
    name,
    role: row.role,
    bio: row.bio,
    photo: row.photo,
    color: row.color,
    initials: initialsOf(name),
  };
}

/** Everything the public wizard needs, in one payload. */
export async function buildCatalog(): Promise<CatalogDto> {
  const [categories, services, staff, links, settings] = await Promise.all([
    listCategories({ activeOnly: true }),
    listServices({ activeOnly: true }),
    listStaff({ activeOnly: true }),
    listStaffServices(),
    getSettings(),
  ]);

  const activeStaff = new Set(staff.map((member) => member.id));
  const staffByService = new Map<string, string[]>();
  for (const link of links) {
    if (!activeStaff.has(link.staff_id)) continue;
    const list = staffByService.get(link.service_id) ?? [];
    list.push(link.staff_id);
    staffByService.set(link.service_id, list);
  }

  const order = new Map(staff.map((member, index) => [member.id, index]));
  const visibleCategories = new Set<string>();
  const serviceDtos: ServiceDto[] = [];

  for (const service of services) {
    const ids = (staffByService.get(service.id) ?? []).sort(
      (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0),
    );
    // A service with nobody assigned can never be booked, so it stays hidden.
    if (!ids.length) continue;
    serviceDtos.push(toServiceDto(service, ids));
    visibleCategories.add(service.category_id);
  }

  const plan = planFor(0, settings);

  return {
    categories: categories.filter((row) => visibleCategories.has(row.id)).map(toCategoryDto),
    services: serviceDtos,
    staff: staff.map(toStaffDto),
    policy: {
      cancellationWindowHours: settings.cancellation_window_hours,
      maxAdvanceDays: settings.max_advance_days,
      minNoticeMinutes: settings.min_notice_min,
      terms: settings.booking_terms,
      paymentLabel: plan.label,
      depositDue: 0,
    },
  };
}

export function toAppointmentDto(input: {
  appointment: AppointmentRow;
  service: ServiceRow;
  staff: StaffRow;
  customer: CustomerRow;
  settings: SettingsRow;
  now?: Date;
  confirmationSent?: boolean;
}): AppointmentDto {
  const {
    appointment,
    service,
    staff,
    customer,
    settings,
    now = new Date(),
    confirmationSent = false,
  } = input;
  const wall = instantToWall(new Date(appointment.start_at));
  const deadline = cancellationDeadline(appointment, settings.cancellation_window_hours);
  const plan = planFor(appointment.price, settings);

  return {
    reference: appointment.reference,
    status: appointment.status,
    startAt: appointment.start_at,
    date: wall.dateKey,
    time: minutesToLabel(wall.minutes),
    duration: appointment.duration_min,
    price: appointment.price,
    priceKind: service.price_kind,
    serviceName: service.name,
    staffName: staffDisplayName(staff),
    staffId: staff.id,
    serviceId: service.id,
    customerFirstName: customer.first_name,
    customerLastName: customer.last_name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    note: appointment.customer_note,
    manageUrl: manageUrl(appointment),
    canCancel: appointment.status !== "CANCELLED" && now <= deadline,
    cancellationDeadline: deadline.toISOString(),
    depositDue: appointment.deposit_amount || plan.amountDue,
    paymentLabel: plan.label,
    confirmationSent,
  };
}

export function appointmentDateLabel(appointment: AppointmentRow) {
  const wall = instantToWall(new Date(appointment.start_at));
  return `${formatDateKey(wall.dateKey)} à ${minutesToLabel(wall.minutes)}`;
}
