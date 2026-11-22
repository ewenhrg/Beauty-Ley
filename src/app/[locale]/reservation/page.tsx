import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { HybridReservation } from "@/components/booking/HybridReservation";
import { getLocale, getT } from "@/i18n/server";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getLocale(), "book");
}

export default async function ReservationPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, "book")} />
      <PageHeader eyebrow={t("booking.fallback.eyebrow")} title={t("page.book.title")}>
        <p>{t("page.book.leadOnline")}</p>
      </PageHeader>

      <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-8 lg:pb-28">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("booking.service.title")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("booking.service.lead")}</p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <HybridReservation />
          </Suspense>
        </div>
      </section>
    </>
  );
}
