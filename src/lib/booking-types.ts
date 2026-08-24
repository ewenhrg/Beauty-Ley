/**
 * Shapes exchanged between the booking API and the client wizard. Kept free of
 * server imports so client components can use them directly.
 */

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
};

export type ServiceDto = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  priceKind: "fixed" | "from";
  image: string | null;
  staffIds: string[];
};

export type StaffDto = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo: string | null;
  color: string;
  initials: string;
};

export type BookingPolicyDto = {
  cancellationWindowHours: number;
  maxAdvanceDays: number;
  minNoticeMinutes: number;
  terms: string;
  paymentLabel: string;
  depositDue: number;
};

export type CatalogDto = {
  categories: CategoryDto[];
  services: ServiceDto[];
  staff: StaffDto[];
  policy: BookingPolicyDto;
};

export type DayDto = {
  date: string;
  open: boolean;
  reason: "closed" | "off" | "full" | "past" | "out-of-range" | null;
  label: string | null;
  slotCount: number;
};

export type SlotDto = {
  time: string;
  minutes: number;
  startAt: string;
  staffIds: string[];
};

export type AppointmentStatusDto =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentDto = {
  reference: string;
  status: AppointmentStatusDto;
  startAt: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  priceKind: "fixed" | "from";
  serviceName: string;
  staffName: string;
  staffId: string;
  serviceId: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string | null;
  note: string | null;
  manageUrl: string;
  canCancel: boolean;
  cancellationDeadline: string;
  depositDue: number;
  paymentLabel: string;
  /** Whether a confirmation email actually left the server. */
  confirmationSent: boolean;
};

export type ApiError = {
  error: { code: string; message: string; field?: string };
};

export function formatEgp(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} EGP`;
}

export function priceLabel(price: number, kind: "fixed" | "from") {
  return kind === "from" ? `À partir de ${formatEgp(price)}` : formatEgp(price);
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
