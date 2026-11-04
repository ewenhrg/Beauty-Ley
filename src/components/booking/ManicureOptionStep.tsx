"use client";

import type { ServiceDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import type { ManicureOptionId } from "@/lib/booking-cart";
import { optionMeta } from "@/lib/booking-cart";
import { Eyebrow, StepLead, StepTitle } from "./ui";
import { useT } from "@/i18n/I18nProvider";

export function ManicureOptionStep({
  services,
  selected,
  stepNumber = 2,
  onSelect,
}: {
  services: ServiceDto[];
  selected: ManicureOptionId | null;
  stepNumber?: number;
  onSelect: (option: ManicureOptionId) => void;
}) {
  const t = useT();
  const nail = optionMeta("nail-art", services);
  const french = optionMeta("french", services);

  const choices: Array<{
    id: ManicureOptionId;
    title: string;
    hint: string;
    price?: string;
  }> = [
    {
      id: "nail-art",
      title: t("booking.options.nailArt"),
      hint: t("booking.options.nailArtHint"),
      price: nail ? priceLabel(nail.price, nail.priceKind, t("price.from")) : undefined,
    },
    {
      id: "french",
      title: t("booking.options.french"),
      hint: t("booking.options.frenchHint"),
      price: french ? priceLabel(french.price, french.priceKind, t("price.from")) : undefined,
    },
    {
      id: "none",
      title: t("booking.options.skip"),
      hint: t("booking.options.skipHint"),
    },
  ];

  return (
    <div>
      <Eyebrow>{t("booking.step", { n: stepNumber })}</Eyebrow>
      <StepTitle>{t("booking.options.title")}</StepTitle>
      <StepLead>{t("booking.options.lead")}</StepLead>

      <ul className="mt-8 space-y-3">
        {choices.map((choice, index) => {
          const active = selected === choice.id;
          return (
            <li
              key={choice.id}
              className="pop-in"
              style={{ "--delay": `${index * 40}ms` } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => onSelect(choice.id)}
                data-selected={active}
                className={`pick-card flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left sm:px-5 ${
                  active
                    ? "border-terracotta bg-blush/40"
                    : "border-line bg-white/55 hover:border-terracotta/50 hover:bg-blush/25"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-ink">{choice.title}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">
                    {choice.hint}
                  </span>
                </span>
                {choice.price ? (
                  <span className="font-display shrink-0 text-lg text-terracotta">{choice.price}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
