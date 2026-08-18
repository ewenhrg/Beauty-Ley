import type { Price } from "@/data/services";

export function formatPrice(price: Price) {
  switch (price.kind) {
    case "fixed":
      return `${price.value} EGP`;
    case "from":
      return `À partir de ${price.value} EGP`;
    case "range":
      return `${price.min} à ${price.max} EGP`;
    case "supplement":
      return `+${price.value} EGP`;
    case "quote":
      return "Sur devis";
  }
}

export function formatPriceShort(price: Price) {
  switch (price.kind) {
    case "fixed":
      return `${price.value}`;
    case "from":
      return `${price.value}`;
    case "range":
      return `${price.min}–${price.max}`;
    case "supplement":
      return `+${price.value}`;
    case "quote":
      return "Devis";
  }
}
