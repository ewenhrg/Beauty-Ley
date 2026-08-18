import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { ServicesPreview } from "@/components/ServicesPreview";
import { GalleryPreview } from "@/components/GalleryPreview";
import { SocialSection } from "@/components/SocialSection";
import { ContactSection } from "@/components/ContactSection";
import { BookingCta } from "@/components/BookingCta";
import { categories } from "@/data/services";
import { PriceList } from "@/components/PriceList";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";

export default function HomePage() {
  const featured = categories
    .filter((category) => category.id === "ongles" || category.id === "cils")
    .flatMap((category) => category.groups.slice(0, 1));

  return (
    <>
      <Hero />
      <About />
      <ServicesPreview />
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
                Tarifs
              </Reveal>
              <Reveal as="h2" delay={80} className="font-display mt-4 text-4xl text-ink sm:text-5xl">
                Aperçu des prix
              </Reveal>
            </div>
            <Link
              href="/tarifs"
              className="nav-link text-[11px] tracking-[0.22em] text-ink-soft uppercase underline-offset-4 hover:text-ink"
            >
              Tarifs complets
            </Link>
          </div>
          <div className="mt-12">
            <PriceList groups={featured} />
          </div>
        </div>
      </section>
      <GalleryPreview />
      <SocialSection />
      <ContactSection />
      <BookingCta />
    </>
  );
}
