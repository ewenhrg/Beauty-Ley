"use client";

import type { ServiceDto, StaffDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import { formatDateKey, formatDuration } from "@/lib/time";
import { Eyebrow, StepLead, StepTitle, SummaryRow } from "./ui";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { intlLocale } from "@/i18n/config";

export type BookingSelection = {
  service: ServiceDto;
  staff: StaffDto | null;
  date: string;
  time: string;
  startAt: string;
};

export function SummaryStep({
  selection,
  policy,
  chooseStaff,
  onEditService,
  onEditStaff,
  onEditSlot,
}: {
  selection: BookingSelection;
  policy: { cancellationWindowHours: number; paymentLabel: string };
  chooseStaff: boolean;
  onEditService: () => void;
  onEditStaff: () => void;
  onEditSlot: () => void;
}) {
  const { service, staff, date, time } = selection;
  const t = useT();
  const locale = useLocale();

  return (
    <div>
      <Eyebrow>{t("booking.step", { n: chooseStaff ? 4 : 3 })}</Eyebrow>
      <StepTitle>{t("booking.summary.title")}</StepTitle>
      <StepLead>{t("booking.summary.lead")}</StepLead>

      <dl className="mt-8 rounded-[1.75rem] border border-line bg-white/55 px-5 py-2 sm:px-7">
        <SummaryRow label={t("booking.summary.service")} value={service.name} onEdit={onEditService} />
        {chooseStaff ? (
          <SummaryRow
            label={t("booking.summary.stylist")}
            value={staff ? staff.name : t("booking.summary.anyStylist")}
            onEdit={onEditStaff}
          />
        ) : null}
        <SummaryRow
          label={t("booking.summary.date")}
          value={formatDateKey(date, { locale: intlLocale(locale) })}
          onEdit={onEditSlot}
        />
        <SummaryRow label={t("booking.summary.time")} value={time} onEdit={onEditSlot} />
        <SummaryRow label={t("booking.summary.duration")} value={formatDuration(service.duration)} />
        <SummaryRow
          label={t("booking.summary.price")}
          value={
            <span className="font-display text-xl text-terracotta">
              {priceLabel(service.price, service.priceKind, t("price.from"))}
            </span>
          }
        />
        <SummaryRow label={t("booking.summary.pay")} value={policy.paymentLabel} />
      </dl>

      <p className="mt-5 text-xs leading-relaxed text-ink-soft">
        {t("booking.summary.cancelPolicy", { hours: policy.cancellationWindowHours })}
      </p>
    </div>
  );
}
