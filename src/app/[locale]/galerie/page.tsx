import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { GalleryGrid } from "@/components/GalleryGrid";
import { BookingCta } from "@/components/BookingCta";
import { getLocale, getT } from "@/i18n/server";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { seoCopy } from "@/i18n/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getLocale(), "gallery");
}

export default async function GaleriePage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, "gallery")} />
      <PageHeader eyebrow={seoCopy(locale).heroKicker} title={t("page.gallery.title")}>
        <p>{t("page.gallery.lead")}</p>
      </PageHeader>
      <section>
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <GalleryGrid />
        </div>
      </section>
      <BookingCta />
    </>
  );
}
