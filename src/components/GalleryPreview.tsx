import Link from "next/link";
import { gallery } from "@/data/gallery";
import { Reveal } from "./Reveal";

export function GalleryPreview() {
  const preview = gallery.slice(0, 9);

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
              Galerie
            </Reveal>
            <Reveal as="h2" delay={80} className="font-display mt-4 text-4xl text-ink sm:text-5xl">
              Le salon & les réalisations
            </Reveal>
          </div>
          <Link
            href="/galerie"
            className="nav-link text-[11px] tracking-[0.22em] text-rose uppercase underline-offset-4 hover:text-ink"
          >
            Voir la galerie
          </Link>
        </div>

        <ul className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {preview.map((item, index) => (
            <Reveal as="li" key={item.src} delay={index * 70} className="mb-4 break-inside-avoid">
              <img
                src={item.src}
                alt={item.alt}
                className="h-auto w-full rounded-[1.5rem]"
                loading="lazy"
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
