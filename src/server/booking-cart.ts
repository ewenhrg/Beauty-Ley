import { getService, listServices } from "./repo/catalog";
import type { ServiceRow } from "./db/types";

export type ManicureOptionId = "nail-art" | "french" | "none";

export type BookingCartItem = {
  serviceId: string;
  manicureOption: ManicureOptionId | null;
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
