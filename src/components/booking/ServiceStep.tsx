"use client";

import { useMemo, useState } from "react";
import type { CatalogDto, ServiceDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import { formatDuration } from "@/lib/time";
import { Eyebrow, StepLead, StepTitle, inputClass } from "./ui";

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function ServiceStep({
  catalog,
  selectedId,
  onSelect,
}: {
  catalog: CatalogDto;
  selectedId: string | null;
  onSelect: (service: ServiceDto) => void;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(
    () => catalog.categories[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");

  const searching = query.trim().length > 1;
  const visible = useMemo(() => {
    if (searching) {
      const needle = normalise(query.trim());
      return catalog.services.filter((service) =>
        normalise(`${service.name} ${service.description ?? ""}`).includes(needle),
      );
    }
    return catalog.services.filter((service) => service.categoryId === categoryId);
  }, [catalog.services, categoryId, query, searching]);

  const categoryName = (id: string) =>
    catalog.categories.find((category) => category.id === id)?.name ?? "";

  return (
    <div>
      <Eyebrow>Étape 1</Eyebrow>
      <StepTitle>Choisissez votre prestation</StepTitle>
      <StepLead>
        Sélectionnez la prestation souhaitée. Pour les cheveux, vous pourrez choisir Bebo, David
        ou peu importe. Pour le reste, le studio attribue la professionnelle.
      </StepLead>

      <div className="mt-8">
        <label className="sr-only" htmlFor="service-search">
          Rechercher une prestation
        </label>
        <div className="relative">
          <SearchIcon />
          <input
            id="service-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une prestation…"
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>

      {searching ? null : (
        <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {catalog.categories.map((category) => {
            const active = category.id === categoryId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-[11px] tracking-[0.16em] uppercase transition-all duration-300 ${
                  active
                    ? "border-terracotta bg-terracotta text-cream shadow-soft"
                    : "border-line bg-white/55 text-ink-soft hover:border-terracotta/50 hover:text-ink"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {visible.map((service, index) => {
          const selected = service.id === selectedId;
          return (
            <li key={service.id} className="pop-in" style={{ "--delay": `${Math.min(index, 8) * 35}ms` } as React.CSSProperties}>
              <button
                type="button"
                onClick={() => onSelect(service)}
                data-selected={selected}
                className={`pick-card flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left sm:px-5 ${
                  selected
                    ? "border-terracotta bg-blush/40"
                    : "border-line bg-white/55 hover:border-terracotta/50 hover:bg-blush/25"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] leading-snug font-medium text-ink">
                    {service.name}
                  </span>
                  {service.description ? (
                    <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">
                      {service.description}
                    </span>
                  ) : null}
                  <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-[0.12em] text-ink-soft uppercase">
                    <span>{formatDuration(service.duration)}</span>
                    {searching ? (
                      <>
                        <span aria-hidden="true" className="text-line">
                          ·
                        </span>
                        <span>{categoryName(service.categoryId)}</span>
                      </>
                    ) : null}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="font-display block text-lg text-terracotta">
                    {priceLabel(service.price, service.priceKind)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-blush/20 px-4 py-6 text-center text-sm text-ink-soft">
          Aucune prestation ne correspond à votre recherche.
        </p>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-soft/60"
      fill="none"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
