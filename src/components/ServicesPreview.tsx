import Link from "next/link";
import { categories } from "@/data/services";
import { BookingButton } from "./BookingButton";
import { Reveal } from "./Reveal";

export function ServicesPreview() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
              Prestations
            </Reveal>
            <Reveal as="h2" delay={80} className="font-display mt-4 text-4xl text-ink sm:text-5xl">
              Ce que nous proposons
            </Reveal>
          </div>
          <Link
            href="/tarifs"
            className="nav-link text-[11px] tracking-[0.22em] text-rose uppercase underline-offset-4 hover:text-ink"
          >
            Voir tous les tarifs
          </Link>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal as="li" key={category.id} delay={index * 90}>
              <Link
                href={category.href}
                className="hover-lift group relative block overflow-hidden rounded-[2rem] ring-1 ring-transparent transition-[box-shadow,transform] hover:ring-gold/60"
              >
                <img
                  src={category.image}
                  alt={category.imageAlt}
                  className="aspect-4/5 w-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-terracotta/85 via-ink/15 to-transparent transition-opacity duration-500 group-hover:from-rose/90" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl text-cream">{category.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-[11px] tracking-[0.2em] text-gold-soft uppercase">
                    Découvrir
                    <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>

        <div className="mt-16 flex justify-center">
          <BookingButton />
        </div>
      </div>
    </section>
  );
}
