import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PriceList } from "@/components/PriceList";
import { BookingButton } from "@/components/BookingButton";
import { categories } from "@/data/services";
import { BookingCta } from "@/components/BookingCta";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Prestations",
  description:
    "Prestations Beauty Ley à Hurghada : cheveux, manucure, pédicure, cils, sourcils, maquillage permanent, épilation et soins du corps.",
};

export default function PrestationsPage() {
  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title="Prestations">
        <p>Les prestations proposées par Beauty Ley, Beauty & Wellness Studio à Hurghada.</p>
      </PageHeader>
      {categories.map((category, index) => (
        <section
          key={category.id}
          id={category.id}
          className={index % 2 === 0 ? "bg-blush/20" : "bg-transparent"}
        >
          <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
            <Reveal as="div" className="lg:sticky lg:top-28">
              <img
                src={category.image}
                alt={category.imageAlt}
                className="hover-lift aspect-4/5 w-full rounded-[2rem] object-cover"
                loading="lazy"
              />
              <h2 className="font-display mt-6 text-3xl">
                <span className="text-gradient">{category.title}</span>
              </h2>
              <div className="mt-6">
                <BookingButton />
              </div>
            </Reveal>
            <PriceList groups={category.groups} />
          </div>
        </section>
      ))}
      <BookingCta />
    </>
  );
}
