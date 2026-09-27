import { salon } from "@/data/salon";

/** Official salon WhatsApp chat, with an optional prefilled booking message. */
export function whatsappBookingUrl(text?: string) {
  const base = salon.social.whatsapp.href;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}
