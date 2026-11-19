import {
  WAVY_EXTRA_DURATION_MIN,
  WAVY_SUPPLEMENT_EGP,
  type BrushingStyleId,
  type ManicureOptionId,
} from "@/lib/booking-cart";
import { getService, listServices } from "./repo/catalog";
import type { ServiceRow } from "./db/types";

export type { BrushingStyleId, ManicureOptionId };

export type BookingCartItem = {
  serviceId: string;
  manicureOption: ManicureOptionId | null;
  brushingStyle: BrushingStyleId | null;
};

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findByName(services: ServiceRow[], predicate: (name: string) => boolean) {
  return services.find((service) => predicate(normalise(service.name))) ?? null;
}

function optionAddon(
  option: ManicureOptionId,
  catalog: ServiceRow[],
): { duration: number; price: number; name: string } | null {
  if (option === "none") return null;
  if (option === "nail-art") {
    const found = findByName(
      catalog,
      (name) => name.includes("nail art") || name.includes("nail-art"),
    );
    return found
      ? { duration: found.duration_min, price: found.price, name: found.name }
      : { duration: 30, price: 150, name: "Nail art" };
  }
  const found = findByName(
    catalog,
    (name) => name.includes("french") || name.includes("babyboomer"),
  );
  return found
    ? { duration: found.duration_min, price: found.price, name: found.name }
    : { duration: 0, price: 250, name: "French" };
}

function brushingAddon(
  style: BrushingStyleId,
): { duration: number; price: number; name: string } | null {
  if (style === "lisse") return { duration: 0, price: 0, name: "Lisse" };
  return {
    duration: WAVY_EXTRA_DURATION_MIN,
    price: WAVY_SUPPLEMENT_EGP,
    name: `Wavy (+${WAVY_SUPPLEMENT_EGP} EGP)`,
  };
}

export async function resolveBookingCart(
  items: BookingCartItem[],
  partySize: number,
  customerNote: string | null,
): Promise<{
  primaryService: ServiceRow;
  durationMin: number;
  price: number;
  note: string;
  labels: string[];
} | null> {
  if (!items.length) return null;

  const catalog = await listServices({ activeOnly: false });
  const byId = new Map(catalog.map((service) => [service.id, service]));

  let duration = 0;
  let price = 0;
  const labels: string[] = [];

  for (const item of items) {
    const service = byId.get(item.serviceId) ?? (await getService(item.serviceId));
    if (!service || !service.active) return null;
    duration += service.duration_min;
    price += service.price;
    let label = service.name;
    if (item.manicureOption && item.manicureOption !== "none") {
      const addon = optionAddon(item.manicureOption, catalog);
      if (addon) {
        duration += addon.duration;
        price += addon.price;
        label = `${service.name} + ${addon.name}`;
      }
    }
    if (item.brushingStyle) {
      const addon = brushingAddon(item.brushingStyle);
      if (addon) {
        duration += addon.duration;
        price += addon.price;
        label =
          item.brushingStyle === "wavy"
            ? `${service.name} · Wavy (+${WAVY_SUPPLEMENT_EGP} EGP)`
            : `${service.name} · Lisse`;
      }
    }
    labels.push(label);
  }

  const primary = byId.get(items[0].serviceId) ?? (await getService(items[0].serviceId));
  if (!primary) return null;

  // Prefer the longest service as the appointment anchor for staff assignment.
  let anchor = primary;
  for (const item of items) {
    const service = byId.get(item.serviceId);
    if (service && service.duration_min > anchor.duration_min) anchor = service;
  }

  const size = Math.min(3, Math.max(1, Math.round(partySize) || 1));
  const lines = [`Prestations: ${labels.join(" · ")}`];
  if (size > 1) lines.push(`Pour ${size} personnes`);
  if (customerNote?.trim()) lines.push(customerNote.trim());

  return {
    primaryService: anchor,
    durationMin: Math.max(5, Math.min(600, duration)),
    price: Math.max(0, price * size),
    note: lines.join("\n").slice(0, 600),
    labels,
  };
}
