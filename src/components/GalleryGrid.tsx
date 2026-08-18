"use client";

import { useMemo, useState } from "react";
import { gallery, type GalleryItem } from "@/data/gallery";
import { Lightbox } from "./Lightbox";
import { Reveal } from "./Reveal";

const filters = [
  { id: "all", label: "Tout" },
  { id: "salon", label: "Le salon" },
  { id: "work", label: "Réalisations" },
] as const;

export function GalleryGrid({ items = gallery, limit }: { items?: GalleryItem[]; limit?: number }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [active, setActive] = useState<number | null>(null);

  const visible = useMemo(() => {
    const list = filter === "all" ? items : items.filter((item) => item.group === filter);
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [filter, items, limit]);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer la galerie">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ${
              filter === item.id
                ? "bg-terracotta text-cream shadow-glow"
                : "text-ink-soft hover:bg-blush/25 hover:text-rose"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="mt-8 columns-1 gap-3 sm:columns-2 lg:columns-3">
        {visible.map((item, index) => (
          <Reveal as="li" key={item.src} delay={(index % 6) * 70} className="mb-3 break-inside-avoid">
            <button
              type="button"
              onClick={() => setActive(index)}
              className="hover-lift block w-full rounded-[1.6rem] focus-visible:outline-terracotta"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="h-auto w-full"
                loading="lazy"
              />
            </button>
          </Reveal>
        ))}
      </ul>

      {active !== null ? (
        <Lightbox
          items={visible}
          index={active}
          onClose={() => setActive(null)}
          onIndex={setActive}
        />
      ) : null}
    </div>
  );
}
