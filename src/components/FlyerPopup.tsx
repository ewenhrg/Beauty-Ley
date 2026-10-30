"use client";

import { useEffect, useRef, useState } from "react";

export type FlyerSlide = {
  id: string;
  description: string;
  image: string;
};

const SESSION_KEY = "beautyley.flyer.dismissed";

export function FlyerPopup({ flyers }: { flyers: FlyerSlide[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!flyers.length) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    setOpen(true);
  }, [flyers.length]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, flyers.length]);

  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function goTo(next: number) {
    if (!flyers.length) return;
    const clamped = ((next % flyers.length) + flyers.length) % flyers.length;
    setIndex(clamped);
    const node = scrollerRef.current;
    if (!node) return;
    const child = node.children[clamped] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function onScroll() {
    const node = scrollerRef.current;
    if (!node) return;
    const width = node.clientWidth || 1;
    const next = Math.round(node.scrollLeft / width);
    if (next !== index && next >= 0 && next < flyers.length) setIndex(next);
  }

  if (!open || !flyers.length) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/55 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Offres du studio"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
        onClick={close}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] bg-cream shadow-soft">
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-ink/55 text-cream transition-colors hover:bg-ink/75"
          aria-label="Fermer"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {flyers.map((flyer) => (
            <article key={flyer.id} className="w-full shrink-0 snap-center">
              <div className="aspect-[4/5] bg-blush/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flyer.image}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
              {flyer.description ? (
                <p className="px-5 py-4 text-sm leading-relaxed text-ink">{flyer.description}</p>
              ) : (
                <div className="h-4" />
              )}
            </article>
          ))}
        </div>

        {flyers.length > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="rounded-full px-3 py-2 text-[11px] tracking-[0.16em] text-ink-soft uppercase hover:text-ink"
            >
              ← Préc.
            </button>
            <div className="flex items-center gap-1.5">
              {flyers.map((flyer, i) => (
                <button
                  key={flyer.id}
                  type="button"
                  aria-label={`Offre ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-terracotta" : "w-1.5 bg-ink/20"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="rounded-full px-3 py-2 text-[11px] tracking-[0.16em] text-ink-soft uppercase hover:text-ink"
            >
              Suiv. →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
