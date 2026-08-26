"use client";

import type { ServiceDto, StaffDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import { formatDateKey, formatDuration } from "@/lib/time";
import { Eyebrow, StepLead, StepTitle, SummaryRow } from "./ui";

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

  return (
    <div>
      <Eyebrow>Étape {chooseStaff ? 4 : 3}</Eyebrow>
      <StepTitle>Votre récapitulatif</StepTitle>
      <StepLead>Vérifiez les informations avant de finaliser votre réservation.</StepLead>

      <dl className="mt-8 rounded-[1.75rem] border border-line bg-white/55 px-5 py-2 sm:px-7">
        <SummaryRow label="Prestation" value={service.name} onEdit={onEditService} />
        {chooseStaff ? (
          <SummaryRow
            label="Coiffeur"
            value={staff ? staff.name : "Peu importe — Bebo ou David"}
            onEdit={onEditStaff}
          />
        ) : null}
        <SummaryRow label="Date" value={formatDateKey(date)} onEdit={onEditSlot} />
        <SummaryRow label="Heure" value={time} onEdit={onEditSlot} />
        <SummaryRow label="Durée" value={formatDuration(service.duration)} />
        <SummaryRow
          label="Prix"
          value={
            <span className="font-display text-xl text-terracotta">
              {priceLabel(service.price, service.priceKind)}
            </span>
          }
        />
        <SummaryRow label="Règlement" value={policy.paymentLabel} />
      </dl>

      <p className="mt-5 text-xs leading-relaxed text-ink-soft">
        Annulation gratuite jusqu&apos;à {policy.cancellationWindowHours} h avant le rendez-vous,
        directement depuis le lien qui vous sera envoyé.
      </p>
    </div>
  );
}
