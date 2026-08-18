import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PriceList } from "@/components/PriceList";
import { BookingCta } from "@/components/BookingCta";
import { Reveal } from "@/components/Reveal";
import { categories } from "@/data/services";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Tarifs Beauty Ley Hurghada. Prestations cheveux, ongles, cils, maquillage permanent, épilation et soins du corps. Prix en EGP.",
};

export default function TarifsPage() {
  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title="Tarifs">
        <p>Prix transcrits depuis les menus officiels du studio. Devise : EGP.</p>
      </PageHeader>
      <div className="bg-transparent">
        <div className="mx-auto max-w-7xl space-y-20 px-5 py-16 sm:px-8 lg:py-24">
          {categories.map((category) => (
            <section key={category.id} id={category.id}>
              <Reveal as="h2" className="font-display mb-8 text-3xl sm:text-4xl">
                <span className="text-gradient">{category.title}</span>
              </Reveal>
              <PriceList groups={category.groups} />
            </section>
          ))}
        </div>
      </div>
      <BookingCta />
    </>
  );
}
