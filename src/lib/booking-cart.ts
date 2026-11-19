import type { CategoryDto, ServiceDto } from "@/lib/booking-types";

export type ManicureOptionId = "nail-art" | "french" | "none";
export type BrushingStyleId = "lisse" | "wavy";

/** Extra charged when the client chooses a wavy brushing. */
export const WAVY_SUPPLEMENT_EGP = 200;
export const WAVY_EXTRA_DURATION_MIN = 15;

export type CartItem = {
  serviceId: string;
  /** Set only for manicure base services; `null` when the question does not apply. */
  manicureOption: ManicureOptionId | null;
  /** Set only for brushing services; `null` otherwise. */
  brushingStyle: BrushingStyleId | null;
};

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function categorySlug(
  service: Pick<ServiceDto, "categoryId">,
  categories: CategoryDto[],
): string {
  return categories.find((item) => item.id === service.categoryId)?.slug ?? "";
}

/** True when the client should see Nail art / French / Skip after picking this service. */
export function needsManicureOptions(
  service: ServiceDto,
  categories: CategoryDto[],
): boolean {
  if (categorySlug(service, categories) !== "manucure") return false;
  const name = normalise(service.name);
  if (name.includes("nail art") || name.includes("nail-art")) return false;
  if (name.includes("french") || name.includes("babyboomer")) return false;
  if (name.includes("ongle casse") || name.includes("broken")) return false;
  if (name.includes("depose") || name.includes("removal") || name.includes("remove")) return false;
  return true;
}

/** True when the client must choose Lisse or Wavy after picking a brushing. */
export function needsBrushingStyle(service: ServiceDto): boolean {
  return normalise(service.name).includes("brushing");
}

export function needsServiceOptions(
  service: ServiceDto,
  categories: CategoryDto[],
): boolean {
  return needsManicureOptions(service, categories) || needsBrushingStyle(service);
}

export function findNailArtService(services: ServiceDto[]): ServiceDto | null {
  return (
    services.find((service) => {
      const name = normalise(service.name);
      return name.includes("nail art") || name.includes("nail-art");
    }) ?? null
  );
}

export function findFrenchService(services: ServiceDto[]): ServiceDto | null {
  return (
    services.find((service) => {
      const name = normalise(service.name);
      return name.includes("french") || name.includes("babyboomer");
    }) ?? null
  );
}

const FALLBACK_NAIL_ART = { duration: 30, price: 150, priceKind: "from" as const, name: "Nail art" };
const FALLBACK_FRENCH = { duration: 0, price: 250, priceKind: "fixed" as const, name: "French" };

export function optionMeta(
  option: ManicureOptionId,
  services: ServiceDto[],
): { duration: number; price: number; priceKind: "fixed" | "from"; name: string } | null {
  if (option === "none") return null;
  if (option === "nail-art") {
    const found = findNailArtService(services);
    return found
      ? {
          duration: found.duration,
          price: found.price,
          priceKind: found.priceKind,
          name: found.name,
        }
      : FALLBACK_NAIL_ART;
  }
  const found = findFrenchService(services);
  return found
    ? {
        duration: found.duration,
        price: found.price,
        priceKind: found.priceKind,
        name: found.name,
      }
    : FALLBACK_FRENCH;
}

export function brushingStyleMeta(
  style: BrushingStyleId,
): { duration: number; price: number; priceKind: "fixed" | "from"; name: string } | null {
  if (style === "lisse") {
    return { duration: 0, price: 0, priceKind: "fixed", name: "Lisse" };
  }
  return {
    duration: WAVY_EXTRA_DURATION_MIN,
    price: WAVY_SUPPLEMENT_EGP,
    priceKind: "fixed",
    name: "Wavy",
  };
}

export function cartTotals(
  items: CartItem[],
  services: ServiceDto[],
  partySize: number,
): {
  durationPerPerson: number;
  pricePerPerson: number;
  priceKind: "fixed" | "from";
  totalPrice: number;
  labels: string[];
} {
  let duration = 0;
  let price = 0;
  let from = false;
  const labels: string[] = [];

  for (const item of items) {
    const service = services.find((entry) => entry.id === item.serviceId);
    if (!service) continue;
    duration += service.duration;
    price += service.price;
    if (service.priceKind === "from") from = true;
    let label = service.name;
    if (item.manicureOption && item.manicureOption !== "none") {
      const meta = optionMeta(item.manicureOption, services);
      if (meta) {
        duration += meta.duration;
        price += meta.price;
        if (meta.priceKind === "from") from = true;
        label = `${service.name} + ${meta.name}`;
      }
    }
    if (item.brushingStyle) {
      const meta = brushingStyleMeta(item.brushingStyle);
      if (meta) {
        duration += meta.duration;
        price += meta.price;
        label =
          item.brushingStyle === "wavy"
            ? `${service.name} · Wavy (+${WAVY_SUPPLEMENT_EGP} EGP)`
            : `${service.name} · Lisse`;
      }
    }
    labels.push(label);
  }

  const size = Math.min(3, Math.max(1, partySize || 1));
  return {
    durationPerPerson: duration,
    pricePerPerson: price,
    priceKind: from ? "from" : "fixed",
    totalPrice: price * size,
    labels,
  };
}

export function buildBookingNote(options: {
  items: CartItem[];
  services: ServiceDto[];
  partySize: number;
  customerNote: string | null;
}): string {
  const lines: string[] = [];
  const totals = cartTotals(options.items, options.services, options.partySize);
  if (totals.labels.length) {
    lines.push(`Prestations: ${totals.labels.join(" · ")}`);
  }
  if (options.partySize > 1) {
    lines.push(`Pour ${options.partySize} personnes`);
  }
  if (options.customerNote?.trim()) {
    lines.push(options.customerNote.trim());
  }
  return lines.join("\n").slice(0, 600);
}
