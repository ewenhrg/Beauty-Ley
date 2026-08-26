/** Row shapes of the booking schema. Field names match `supabase/schema.sql`. */

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

/** Statuses that occupy a slot on the calendar. */
export const BLOCKING_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED"];

export type PaymentMode = "onsite" | "deposit" | "full";
export type PaymentStatus = "NONE" | "PENDING" | "PAID" | "REFUNDED";

export type ServiceCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  active: boolean;
};

export type ServiceRow = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  /** Effective duration of the appointment, in minutes. */
  duration_min: number;
  /** Extra minutes blocked after the appointment (cleaning, setup). */
  buffer_min: number;
  price: number;
  /** `fixed` shows "1600 EGP", `from` shows "À partir de 1600 EGP". */
  price_kind: "fixed" | "from";
  image: string | null;
  sort_order: number;
  active: boolean;
};

export type StaffRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  role: string | null;
  bio: string | null;
  photo: string | null;
  /** Accent colour used in the admin calendar. */
  color: string;
  sort_order: number;
  active: boolean;
};

export type StaffServiceRow = {
  id: string;
  staff_id: string;
  service_id: string;
};

/**
 * One work window. Several rows for the same weekday describe a split shift,
 * which is how lunch breaks are represented (09:00-13:00 + 14:00-19:00).
 */
export type StaffScheduleRow = {
  id: string;
  staff_id: string;
  weekday: number;
  start_min: number;
  end_min: number;
};

export type StaffTimeOffRow = {
  id: string;
  staff_id: string;
  /** UTC ISO instants. */
  start_at: string;
  end_at: string;
  reason: string | null;
};

export type BusinessHoursRow = {
  id: string;
  weekday: number;
  open_min: number;
  close_min: number;
  closed: boolean;
};

/** Salon-wide closures: public holidays, annual leave, exceptional days. */
export type BusinessClosureRow = {
  id: string;
  start_date: string;
  end_date: string;
  label: string;
};

export type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  /** Internal notes, staff only — never returned to the public API. */
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentRow = {
  id: string;
  /** Human-readable public reference, e.g. `BL-7K4Q2M`. */
  reference: string;
  /** Secret used by the client-facing manage/cancel link. */
  manage_token: string;
  customer_id: string;
  staff_id: string;
  service_id: string;
  /** UTC ISO instants. `end_at` already includes the service buffer. */
  start_at: string;
  end_at: string;
  duration_min: number;
  buffer_min: number;
  status: AppointmentStatus;
  /** Price snapshot in EGP, resolved server-side at booking time. */
  price: number;
  customer_note: string | null;
  admin_note: string | null;
  source: "online" | "admin";
  payment_status: PaymentStatus;
  deposit_amount: number;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  cancelled_by: "customer" | "salon" | null;
};

export type NotificationRow = {
  id: string;
  appointment_id: string | null;
  channel: "email" | "sms" | "whatsapp";
  kind: "confirmation" | "reminder" | "reschedule" | "cancellation";
  recipient: string;
  subject: string | null;
  body: string;
  status: "queued" | "sent" | "failed" | "skipped";
  error: string | null;
  created_at: string;
  sent_at: string | null;
};

export type AdminPageId =
  | "dashboard"
  | "calendrier"
  | "rendez-vous"
  | "clients"
  | "prestations"
  | "equipe"
  | "parametres"
  | "comptes";

export type AdminUserRow = {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  /** Page ids this person may open. The owner account ignores this list. */
  pages: AdminPageId[];
  staff_id: string | null;
  /** When true, calendar and appointments are limited to `staff_id`. */
  own_agenda: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type SettingsRow = {
  id: string;
  /** Slot grid in minutes (15 => 09:00, 09:15, …). */
  slot_granularity_min: number;
  /** Minimum notice before a slot can be booked online. */
  min_notice_min: number;
  /** How far ahead online booking is open. */
  max_advance_days: number;
  /** Free cancellation window, in hours. */
  cancellation_window_hours: number;
  /** New online bookings land as PENDING or CONFIRMED. */
  auto_confirm: boolean;
  payment_mode: PaymentMode;
  deposit_percent: number;
  booking_terms: string;
  salon_email: string | null;
  salon_phone: string | null;
  updated_at: string;
};

export type Tables = {
  service_categories: ServiceCategoryRow;
  services: ServiceRow;
  staff: StaffRow;
  staff_services: StaffServiceRow;
  staff_schedules: StaffScheduleRow;
  staff_time_off: StaffTimeOffRow;
  business_hours: BusinessHoursRow;
  business_closures: BusinessClosureRow;
  customers: CustomerRow;
  appointments: AppointmentRow;
  notifications: NotificationRow;
  settings: SettingsRow;
  admin_users: AdminUserRow;
};

export type TableName = keyof Tables;

export const TABLE_NAMES: TableName[] = [
  "service_categories",
  "services",
  "staff",
  "staff_services",
  "staff_schedules",
  "staff_time_off",
  "business_hours",
  "business_closures",
  "customers",
  "appointments",
  "notifications",
  "settings",
  "admin_users",
];
