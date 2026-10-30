"use client";

import { useEffect, useMemo, useState } from "react";
import { BookingApiError, fetchCatalog } from "@/lib/booking-client";
import type { CatalogDto, ServiceDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import { whatsappBookingUrl } from "@/lib/whatsapp";
import { useT } from "@/i18n/I18nProvider";
import { WhatsAppIcon } from "../SocialIcons";
import { BookingFlow } from "./BookingFlow";
import { Notice, Skeleton } from "./ui";

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function HybridReservation() {
  const t = useT();
  const [catalog, setCatalog] = useState<CatalogDto | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [onlineServiceId, setOnlineServiceId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalog(controller.signal)
      .then((data) => {
        setCatalog(data);
        setCategoryId((current) => current || data.categories[0]?.id || "");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setCatalogError(
          error instanceof BookingApiError ? error.message : t("booking.loadError"),
        );
      });
    return () => controller.abort();
  }, [t]);

  const services = catalog?.services ?? [];
  const categories = useMemo(() => {
    if (!catalog) return [];
    const used = new Set(services.map((service) => service.categoryId));
    return catalog.categories.filter((category) => used.has(category.id));
  }, [catalog, services]);

  const searching = query.trim().length > 1;
  const visible = useMemo(() => {
    if (searching) {
      const needle = normalise(query.trim());
      return services.filter((service) => normalise(service.name).includes(needle));
    }
    return services.filter((service) => service.categoryId === categoryId);
  }, [services, categoryId, query, searching]);

  const selected = services.find((service) => service.id === selectedId) ?? null;
  const fromLabel = t("price.from");

  if (onlineServiceId) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setOnlineServiceId(null);
            setSelectedId(onlineServiceId);
          }}
          className="mb-6 text-[11px] tracking-[0.18em] text-ink-soft uppercase transition-colors hover:text-terracotta"
        >
          ← {t("booking.changeService")}
        </button>
        <BookingFlow presetServiceId={onlineServiceId} hideServiceStep />
      </div>
    );
  }

  if (catalogError) {
    return <Notice tone="error">{catalogError}</Notice>;
  }

  if (!catalog) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  const whatsappHref =
    selected?.bookingChannel === "whatsapp"
      ? whatsappBookingUrl(t("booking.whatsapp.forService", { service: selected.name }))
      : null;

  return (
    <div>
      <div className="relative">
        <label className="sr-only" htmlFor="hybrid-service-search">
          {t("booking.service.search")}
        </label>
        <SearchIcon />
        <input
          id="hybrid-service-search"
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
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {visible.map((service) => (
          <ServicePickRow
            key={service.id}
            service={service}
            selected={service.id === selectedId}
            searching={searching}
            categoryName={
              categories.find((category) => category.id === service.categoryId)?.name ?? ""
            }
            price={priceLabel(service.price, service.priceKind, fromLabel)}
            channelLabel={
              service.bookingChannel === "online"
                ? t("booking.channel.online")
                : t("booking.channel.whatsapp")
            }
            onSelect={() => setSelectedId(service.id)}
          />
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-blush/20 px-4 py-6 text-center text-sm text-ink-soft">
          {t("booking.service.empty")}
        </p>
      ) : null}

      <div className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mt-8 border-t border-line bg-cream/95 pt-4 backdrop-blur-md sm:static sm:bottom-auto sm:border-0 sm:bg-transparent sm:pt-8 sm:backdrop-blur-none">
        {selected?.bookingChannel === "online" ? (
          <button
            type="button"
            onClick={() => setOnlineServiceId(selected.id)}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-terracotta px-6 text-[11px] font-medium tracking-[0.22em] text-cream uppercase shadow-soft transition-all duration-300 hover:bg-rose hover:shadow-glow"
          >
            {t("booking.online.cta")}
          </button>
        ) : whatsappHref ? (
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

function ServicePickRow({
  service,
  selected,
  searching,
  categoryName,
  price,
  channelLabel,
  onSelect,
}: {
  service: ServiceDto;
  selected: boolean;
  searching: boolean;
  categoryName: string;
  price: string;
  channelLabel: string;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors sm:px-5 ${
          selected
            ? "border-terracotta bg-blush/40"
            : "border-line bg-white/55 hover:border-terracotta/50 hover:bg-blush/25"
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-snug font-medium text-ink">
            {service.name}
          </span>
          <span className="mt-1 block text-[11px] tracking-[0.12em] text-ink-soft uppercase">
            {channelLabel}
            {searching ? ` · ${categoryName}` : ""}
          </span>
        </span>
        <span className="font-display shrink-0 text-lg text-terracotta">{price}</span>
      </button>
    </li>
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
