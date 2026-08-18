"use client";

import { useEffect } from "react";
import type { GalleryItem } from "@/data/gallery";

type Props = {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onIndex: (index: number) => void;
};

export function Lightbox({ items, index, onClose, onIndex }: Props) {
  const item = items[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (event.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, onClose, onIndex]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/92 p-4">
      <button type="button" className="absolute inset-0" aria-label="Fermer" onClick={onClose} />
      <figure className="relative z-10 max-h-[90vh] max-w-5xl">
        <img
          src={item.src}
          alt={item.alt}
          className="max-h-[82vh] w-auto max-w-full object-contain"
        />
        <figcaption className="mt-4 text-center text-sm text-cream/80">{item.alt}</figcaption>
      </figure>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 text-[11px] tracking-[0.2em] text-cream uppercase"
      >
        Fermer
      </button>
      <button
        type="button"
        className="absolute top-1/2 left-4 -translate-y-1/2 text-cream"
        aria-label="Image précédente"
        onClick={() => onIndex((index - 1 + items.length) % items.length)}
      >
        ←
      </button>
      <button
        type="button"
        className="absolute top-1/2 right-4 -translate-y-1/2 text-cream"
        aria-label="Image suivante"
        onClick={() => onIndex((index + 1) % items.length)}
      >
        →
      </button>
    </div>
  );
}
