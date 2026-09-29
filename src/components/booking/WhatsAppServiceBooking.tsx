"use client";

import { useMemo, useState } from "react";
import {
  categories,
  itemCatalogKey,
} from "@/data/services";
import { formatPrice } from "@/lib/format";
import { whatsappBookingUrl } from "@/lib/whatsapp";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { catalogLabel } from "@/i18n/catalog";
import { categoryKey } from "@/i18n/keys";
import { WhatsAppIcon } from "../SocialIcons";

type PickableService = {
  id: string;
  name: string;
  categoryId: string;
  priceLabel: string;
};

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function WhatsAppServiceBooking() {
  const t = useT();
  const locale = useLocale();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const services = useMemo<PickableService[]>(() => {
    const priceLabels = {
      from: t("price.from"),
      quote: t("price.quote"),
      range: t("price.range"),
    };
    return categories.flatMap((category) =>
      category.groups.flatMap((group) =>
        group.items.map((item) => {
          const name = catalogLabel(locale, itemCatalogKey(group.id, item.id), item.name);
          return {
            id: `${category.id}:${group.id}:${item.id}`,
            name,
            categoryId: category.id,
            priceLabel: formatPrice(item.price, priceLabels),
          };
        }),
      ),
    );
  }, [t, locale]);

  const searching = query.trim().length > 1;
  const visible = useMemo(() => {
    if (searching) {
      const needle = normalise(query.trim());
      return services.filter((service) => normalise(service.name).includes(needle));
    }
    return services.filter((service) => service.categoryId === categoryId);
  }, [services, categoryId, query, searching]);

  const selected = services.find((service) => service.id === selectedId) ?? null;
  const whatsappHref = selected
    ? whatsappBookingUrl(t("booking.whatsapp.forService", { service: selected.name }))
    : null;

  const categoryName = (id: string) => {
    const key = categoryKey(id);
    if (key) return t(key);
    return categories.find((category) => category.id === id)?.title ?? id;
  };

  return (
    <div>
      <div className="relative">
        <label className="sr-only" htmlFor="wa-service-search">
          {t("booking.service.search")}
        </label>
        <SearchIcon />
        <input
          id="wa-service-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("booking.service.searchPlaceholder")}
          className="w-full rounded-2xl border border-line bg-white/70 py-3.5 pr-4 pl-11 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-terracotta"
        />
      </div>

      {searching ? null : (
        <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {categories.map((category) => {
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
                {categoryName(category.id)}
              </button>
            );
          })}
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {visible.map((service) => {
          const selectedService = service.id === selectedId;
          return (
            <li key={service.id}>
              <button
                type="button"
                onClick={() => setSelectedId(service.id)}
                aria-pressed={selectedService}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors sm:px-5 ${
                  selectedService
                    ? "border-terracotta bg-blush/40"
                    : "border-line bg-white/55 hover:border-terracotta/50 hover:bg-blush/25"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] leading-snug font-medium text-ink">
                    {service.name}
                  </span>
                  {searching ? (
                    <span className="mt-1 block text-[11px] tracking-[0.12em] text-ink-soft uppercase">
                      {categoryName(service.categoryId)}
                    </span>
                  ) : null}
                </span>
                <span className="font-display shrink-0 text-lg text-terracotta">
                  {service.priceLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-blush/20 px-4 py-6 text-center text-sm text-ink-soft">
          {t("booking.service.empty")}
        </p>
      ) : null}

      <div className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mt-8 border-t border-line bg-cream/95 pt-4 backdrop-blur-md sm:static sm:bottom-auto sm:border-0 sm:bg-transparent sm:pt-8 sm:backdrop-blur-none">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-terracotta px-6 text-[11px] font-medium tracking-[0.22em] text-cream uppercase shadow-soft transition-all duration-300 hover:bg-rose hover:shadow-glow"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {t("booking.whatsapp.cta")}
          </a>
        ) : (
          <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-center text-sm text-ink-soft">
            {t("booking.whatsapp.pick")}
          </p>
        )}
      </div>
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
