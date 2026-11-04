"use client";

import { Eyebrow, StepLead, StepTitle } from "./ui";
import { useT } from "@/i18n/I18nProvider";

export function AddMoreStep({
  labels,
  stepNumber = 2,
  onAnswer,
}: {
  labels: string[];
  stepNumber?: number;
  onAnswer: (yes: boolean) => void;
}) {
  const t = useT();

  return (
    <div>
      <Eyebrow>{t("booking.step", { n: stepNumber })}</Eyebrow>
      <StepTitle>{t("booking.addMore.title")}</StepTitle>
      <StepLead>{t("booking.addMore.lead")}</StepLead>

      {labels.length ? (
        <ul className="mt-6 space-y-2 rounded-2xl border border-line bg-blush/20 px-4 py-4">
          {labels.map((label) => (
            <li key={label} className="text-[14px] text-ink">
              · {label}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onAnswer(true)}
          className="pick-card rounded-2xl border border-line bg-white/55 px-5 py-5 text-left transition-colors hover:border-terracotta/50 hover:bg-blush/25"
        >
          <span className="block text-[15px] font-medium text-ink">{t("booking.addMore.yes")}</span>
          <span className="mt-1 block text-[13px] text-ink-soft">{t("booking.addMore.yesHint")}</span>
        </button>
        <button
          type="button"
          onClick={() => onAnswer(false)}
          className="pick-card rounded-2xl border border-terracotta bg-blush/40 px-5 py-5 text-left"
        >
          <span className="block text-[15px] font-medium text-ink">{t("booking.addMore.no")}</span>
          <span className="mt-1 block text-[13px] text-ink-soft">{t("booking.addMore.noHint")}</span>
        </button>
      </div>
    </div>
  );
}
