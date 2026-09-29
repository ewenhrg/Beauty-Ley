import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppServiceBooking } from "@/components/booking/WhatsAppServiceBooking";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("page.book.title"), description: t("page.book.meta") };
}

export default async function ReservationPage() {
  const t = await getT();

  return (
    <>
      <PageHeader eyebrow={t("booking.fallback.eyebrow")} title={t("page.book.title")}>
        <p>{t("page.book.leadOnline")}</p>
      </PageHeader>

      <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-8 lg:pb-28">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("booking.service.title")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("booking.service.lead")}</p>
        <div className="mt-8">
          <WhatsAppServiceBooking />
        </div>
      </section>
    </>
  );
}
