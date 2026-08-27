import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { GalleryGrid } from "@/components/GalleryGrid";
import { BookingCta } from "@/components/BookingCta";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("page.gallery.title"), description: t("page.gallery.meta") };
}

export default async function GaleriePage() {
  const t = await getT();
  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title={t("page.gallery.title")}>
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
