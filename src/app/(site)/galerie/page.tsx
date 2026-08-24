import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { GalleryGrid } from "@/components/GalleryGrid";
import { BookingCta } from "@/components/BookingCta";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Galerie Beauty Ley Hurghada : le salon, les réalisations ongles, cils et l’ambiance du studio.",
};

export default function GaleriePage() {
  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title="Galerie">
        <p>Le studio, les espaces de soin et les réalisations.</p>
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
