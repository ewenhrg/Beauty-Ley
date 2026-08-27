import type { MessageKey } from "./messages";

const CATEGORY_KEYS: Record<string, MessageKey> = {
  cheveux: "cat.cheveux",
  coiffure: "cat.cheveux",
  coloration: "cat.cheveux",
  ongles: "cat.ongles",
  manucure: "cat.ongles",
  pedicure: "cat.ongles",
  cils: "cat.cils",
  sourcils: "cat.cils",
  "maquillage-permanent": "cat.maquillage-permanent",
  esthetique: "cat.esthetique",
  epilation: "cat.esthetique",
  soins: "cat.soins",
};

const ADMIN_NAV_KEYS: Record<string, MessageKey> = {
  dashboard: "admin.nav.dashboard",
  calendrier: "admin.nav.calendrier",
  "rendez-vous": "admin.nav.rendez-vous",
  clients: "admin.nav.clients",
  prestations: "admin.nav.prestations",
  equipe: "admin.nav.equipe",
  parametres: "admin.nav.parametres",
  comptes: "admin.nav.comptes",
};

const BOOKING_STEP_KEYS: Record<string, MessageKey> = {
  service: "booking.steps.service",
  staff: "booking.steps.staff",
  slot: "booking.steps.slot",
  summary: "booking.steps.summary",
  details: "booking.steps.details",
};

const STATUS_KEYS: Record<string, MessageKey> = {
  PENDING: "admin.status.PENDING",
  CONFIRMED: "admin.status.CONFIRMED",
  COMPLETED: "admin.status.COMPLETED",
  CANCELLED: "admin.status.CANCELLED",
  NO_SHOW: "admin.status.NO_SHOW",
};

export function categoryKey(id: string): MessageKey | null {
  return CATEGORY_KEYS[id] ?? null;
}

export function adminNavKey(id: string): MessageKey {
  return ADMIN_NAV_KEYS[id] ?? "admin.nav.dashboard";
}

export function bookingStepKey(id: string): MessageKey {
  return BOOKING_STEP_KEYS[id] ?? "booking.steps.service";
}

export function statusKey(status: string): MessageKey {
  return STATUS_KEYS[status] ?? "admin.status.PENDING";
}
