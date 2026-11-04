"use client";

import { Eyebrow, StepLead, StepTitle } from "./ui";
import { useT } from "@/i18n/I18nProvider";

const SIZES = [1, 2, 3] as const;

export function PartySizeStep({
  selected,
  stepNumber = 4,
  onSelect,
}: {
  selected: number;
  stepNumber?: number;
  onSelect: (size: number) => void;
}) {
  const t = useT();

  return (
    <div>
      <Eyebrow>{t("booking.step", { n: stepNumber })}</Eyebrow>
      <StepTitle>{t("booking.party.title")}</StepTitle>
      <StepLead>{t("booking.party.lead")}</StepLead>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {SIZES.map((size) => {
          const active = selected === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              aria-pressed={active}
              className={`pick-card rounded-2xl border px-3 py-6 text-center transition-colors ${
                active
                  ? "border-terracotta bg-blush/40"
                  : "border-line bg-white/55 hover:border-terracotta/50 hover:bg-blush/25"
              }`}
            >
              <span className="font-display block text-3xl text-terracotta">{size}</span>
              <span className="mt-2 block text-[11px] tracking-[0.14em] text-ink-soft uppercase">
                {t(size === 1 ? "booking.party.one" : "booking.party.many", { n: size })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
