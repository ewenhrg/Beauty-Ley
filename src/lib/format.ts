import type { Price } from "@/data/services";

export function formatPrice(
  price: Price,
  labels: { from: string; quote: string; range: string } = {
    from: "From",
    quote: "On request",
    range: "{min} to {max} EGP",
  },
) {
  switch (price.kind) {
    case "fixed":
      return `${price.value} EGP`;
    case "from":
      return `${labels.from} ${price.value} EGP`;
    case "range":
      return labels.range.replace("{min}", String(price.min)).replace("{max}", String(price.max));
    case "supplement":
      return `+${price.value} EGP`;
    case "quote":
      return labels.quote;
  }
}

export function formatPriceShort(price: Price, quote = "Quote") {
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
      return quote;
  }
}
