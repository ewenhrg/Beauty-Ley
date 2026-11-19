"use client";

import { formatEgp } from "@/lib/booking-types";
import type { BrushingStyleId } from "@/lib/booking-cart";
import { WAVY_SUPPLEMENT_EGP } from "@/lib/booking-cart";
import { Eyebrow, StepLead, StepTitle } from "./ui";
import { useT } from "@/i18n/I18nProvider";

export function BrushingStyleStep({
  selected,
  stepNumber = 2,
  onSelect,
}: {
  selected: BrushingStyleId | null;
  stepNumber?: number;
  onSelect: (style: BrushingStyleId) => void;
}) {
  const t = useT();
  const amount = formatEgp(WAVY_SUPPLEMENT_EGP);

  const choices: Array<{
    id: BrushingStyleId;
    title: string;
    hint: string;
    price?: string;
  }> = [
    {
      id: "lisse",
      title: t("booking.brushing.lisse"),
      hint: t("booking.brushing.lisseHint"),
    },
    {
      id: "wavy",
      title: t("booking.brushing.wavy"),
      hint: t("booking.brushing.wavyHint", { amount }),
      price: t("booking.brushing.wavyExtra", { amount }),
    },
  ];

  return (
    <div>
      <Eyebrow>{t("booking.step", { n: stepNumber })}</Eyebrow>
      <StepTitle>{t("booking.brushing.title")}</StepTitle>
      <StepLead>{t("booking.brushing.lead")}</StepLead>

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
