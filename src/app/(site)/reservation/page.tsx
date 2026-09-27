import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getT } from "@/i18n/server";
import { whatsappBookingUrl } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("page.book.title"), description: t("page.book.meta") };
}

export const dynamic = "force-dynamic";

/** Old /reservation links open the salon WhatsApp instead of the calendar. */
export default async function ReservationPage() {
  const t = await getT();
  redirect(whatsappBookingUrl(t("cta.whatsappMessage")));
}
