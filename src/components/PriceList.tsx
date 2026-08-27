"use client";

import type { ServiceGroup } from "@/data/services";
import { formatPrice } from "@/lib/format";
import { ColorPriceTable } from "./ColorPriceTable";
import { Reveal } from "./Reveal";
import { useT } from "@/i18n/I18nProvider";

export function PriceList({ groups }: { groups: ServiceGroup[] }) {
  const t = useT();
  const labels = { from: t("price.from"), quote: t("price.quote"), range: t("price.range") };

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-14">
      {groups.map((group, index) => (
        <Reveal
          as="section"
          key={group.id}
          delay={(index % 4) * 90}
          aria-labelledby={group.id}
          className={`min-w-0${group.id === "coloration-avancee" ? " lg:col-span-2" : ""}`}
        >
          <h3
            id={group.id}
            className="bg-terracotta px-4 py-3 text-[12px] font-medium tracking-[0.22em] text-cream uppercase"
          >
            {group.title}
          </h3>
          {group.id === "coloration-avancee" ? (
            <div className="mt-5">
              <ColorPriceTable />
              <ul className="mt-6">
                {group.items
                  .filter((item) => item.price.kind === "quote")
                  .map((item) => (
                    <li
                      key={item.name}
                      className="flex items-baseline justify-between gap-4 border-b border-line py-3.5 transition-colors hover:bg-blush/15"
                    >
                      <span className="text-sm tracking-wide text-ink">{item.name}</span>
                      <span className="price-chip shrink-0 bg-ink px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] text-cream">
                        {formatPrice(item.price, labels)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <ul>
              {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex flex-col gap-1 border-b border-line py-3.5 transition-colors hover:bg-blush/15 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                    >
                      <span className="text-sm tracking-wide text-ink">{item.name}</span>
                      <span className="price-chip w-fit shrink-0 px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] text-cream">
                    {item.price.kind === "from" ? (
                      <span className="block text-center">
                        <span className="block text-[8px] tracking-[0.14em] uppercase opacity-80">
                          {t("price.from")}
                        </span>
                        {item.price.value} EGP
                      </span>
                    ) : (
                      formatPrice(item.price, labels)
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {group.notes?.map((note) => (
            <p key={note} className="mt-3 text-[11px] tracking-[0.12em] text-ink-soft uppercase">
              {note}
            </p>
          ))}
        </Reveal>
      ))}
    </div>
  );
}
