"use client";

import { useLocale, useT } from "@/i18n/I18nProvider";
import { catalogLabel } from "@/i18n/catalog";

export function ColorPriceTable() {
  const t = useT();
  const locale = useLocale();
  const techniques = [
    { id: "ombre", label: catalogLabel(locale, "color.ombre", "Ombré") },
    { id: "balayage", label: catalogLabel(locale, "color.balayage", "Balayage") },
    { id: "highlight", label: catalogLabel(locale, "color.highlight", "Highlight") },
  ] as const;
  const rows = [
    { id: "short", label: catalogLabel(locale, "color.short", "Cheveux court"), prices: [4500, 5000, 7000] },
    {
      id: "medium",
      label: catalogLabel(locale, "color.medium", "Cheveux mi-longs"),
      prices: [5500, 6000, 8500],
    },
    { id: "long", label: catalogLabel(locale, "color.long", "Cheveux longs"), prices: [6000, 7000, 9500] },
  ];

  return (
    <div className="overflow-x-auto">
      <p className="mb-3 text-[10px] tracking-[0.18em] text-ink-soft uppercase">{t("price.from")}</p>
      <table className="w-full min-w-[32rem] border-collapse text-left">
        <thead>
          <tr>
            <th className="bg-terracotta px-3 py-3 text-[11px] font-medium tracking-[0.16em] text-cream uppercase">
              {catalogLabel(locale, "color.length", "Longueur")}
            </th>
            {techniques.map((technique) => (
              <th
                key={technique.id}
                className="bg-terracotta px-3 py-3 text-[11px] font-medium tracking-[0.16em] text-cream uppercase"
              >
                {technique.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line transition-colors hover:bg-blush/15">
              <th scope="row" className="py-3.5 pr-3 text-sm font-normal text-ink">
                {row.label}
              </th>
              {row.prices.map((price, index) => (
                <td key={`${row.id}-${techniques[index].id}`} className="py-3.5">
                  <span className="price-chip inline-block px-2.5 py-1 text-[11px] font-medium text-cream">
                    {price} EGP
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
