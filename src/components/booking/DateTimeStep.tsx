"use client";

import { useMemo, useState } from "react";
import type { ServiceDto, SlotDto, StaffDto } from "@/lib/booking-types";
import { addDays, formatDateKey, todayKey } from "@/lib/time";
import { BookingCalendar } from "./BookingCalendar";
import { useMonthAvailability, useSlots } from "./useAvailability";
import { Eyebrow, Notice, Skeleton, StepLead, StepTitle } from "./ui";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { intlLocale } from "@/i18n/config";

export function DateTimeStep({
  service,
  staffId,
  staff,
  date,
  startAt,
  revision,
  stepNumber = 3,
  revealStaff = true,
  onSelectDate,
  onSelectSlot,
}: {
  service: ServiceDto;
  staffId: string | null;
  staff: StaffDto[];
  date: string | null;
  startAt: string | null;
  revision: number;
  stepNumber?: number;
  /** When false, slot tooltips do not name who is free. */
  revealStaff?: boolean;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: SlotDto, date: string) => void;
}) {
  const t = useT();
  const locale = useLocale();
  const intl = intlLocale(locale);
  const PERIODS = [
    { id: "morning" as const, label: t("booking.slot.morning"), from: 0, to: 12 * 60 },
    { id: "afternoon" as const, label: t("booking.slot.afternoon"), from: 12 * 60, to: 17 * 60 },
    { id: "evening" as const, label: t("booking.slot.evening"), from: 17 * 60, to: 24 * 60 },
  ];
  const today = todayKey();
  const [monthKey, setMonthKey] = useState(() => (date ?? today).slice(0, 7));
  const month = useMonthAvailability(service.id, staffId, monthKey, revision);

  // Until the client picks a day, preselect the first bookable one of the month.
  const suggested =
    month.nextOpenDay && month.nextOpenDay.slice(0, 7) === monthKey ? month.nextOpenDay : null;
  const activeDate = date ?? suggested;
  const slots = useSlots(service.id, staffId, activeDate, revision);

  const grouped = useMemo(
    () =>
      PERIODS.map((period) => ({
        ...period,
        slots: slots.slots.filter(
          (slot) => slot.minutes >= period.from && slot.minutes < period.to,
        ),
      })).filter((period) => period.slots.length > 0),
    [slots.slots],
  );

  const quickDays = [
    { date: today, label: t("booking.slot.today") },
    { date: addDays(today, 1), label: t("booking.slot.tomorrow") },
  ].filter((entry) => month.days.get(entry.date)?.open);

  const jumpTo = (next: string) => {
    setMonthKey(next.slice(0, 7));
    onSelectDate(next);
  };

  const staffName = (id: string) => staff.find((member) => member.id === id)?.name ?? "";

  return (
    <div>
      <Eyebrow>{t("booking.step", { n: stepNumber })}</Eyebrow>
      <StepTitle>{t("booking.slot.title")}</StepTitle>
      <StepLead>{t("booking.slot.lead")}</StepLead>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-8">
        <div>
          {quickDays.length || month.nextOpenDay ? (
            <div className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {quickDays.map((entry) => (
                <QuickChip
                  key={entry.date}
                  active={activeDate === entry.date}
                  label={entry.label}
                  onClick={() => jumpTo(entry.date)}
                />
              ))}
              {month.nextOpenDay && !quickDays.some((entry) => entry.date === month.nextOpenDay) ? (
                <QuickChip
                  active={activeDate === month.nextOpenDay}
                  label={t("booking.slot.next", { date: formatDateKey(month.nextOpenDay, { locale: intl }) })}
                  onClick={() => jumpTo(month.nextOpenDay as string)}
                />
              ) : null}
            </div>
          ) : null}

          <BookingCalendar
            monthKey={monthKey}
            days={month.days}
            selected={activeDate}
            loading={month.loading}
            maxAdvanceDays={month.maxAdvanceDays}
            onSelect={onSelectDate}
            onMonthChange={setMonthKey}
          />

          {month.error ? (
            <div className="mt-4">
              <Notice tone="error">{month.error}</Notice>
            </div>
          ) : null}
        </div>

        <div>
          <p className="font-display text-xl text-ink">
            {activeDate ? formatDateKey(activeDate, { locale: intl }) : t("booking.slot.pickDate")}
          </p>

          {slots.loading ? (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="h-11" />
              ))}
            </div>
          ) : slots.error ? (
            <div className="mt-5">
              <Notice tone="error">{slots.error}</Notice>
            </div>
          ) : !activeDate ? (
            <p className="mt-5 rounded-2xl border border-line bg-blush/20 px-4 py-8 text-center text-sm text-ink-soft">
              {t("booking.slot.pickDay")}
            </p>
          ) : grouped.length === 0 ? (
            <div className="mt-5">
              <Notice>
                {slots.reason === "closed"
                  ? (slots.label ?? t("booking.slot.closed"))
                  : slots.reason === "off"
                    ? t("booking.slot.off")
                    : t("booking.slot.full")}
              </Notice>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {grouped.map((period) => (
                <div key={period.id}>
                  <p className="text-[10px] tracking-[0.24em] text-rose uppercase">{period.label}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {period.slots.map((slot, index) => {
                      const selected = slot.startAt === startAt;
                      return (
                        <button
                          key={slot.startAt}
                          type="button"
                          onClick={() => onSelectSlot(slot, activeDate)}
                          data-selected={selected}
                          title={
                            revealStaff && !staffId
                              ? t("booking.slot.with", {
                                  names: slot.staffIds.map(staffName).filter(Boolean).join(", "),
                                })
                              : undefined
                          }
                          className={`pick-card pop-in rounded-xl border py-3 text-sm tracking-wide transition-colors ${
                            selected
                              ? "border-terracotta bg-terracotta text-cream"
                              : "border-line bg-white/60 text-ink hover:border-terracotta hover:bg-blush/30"
                          }`}
                          style={
                            { "--delay": `${Math.min(index, 10) * 25}ms` } as React.CSSProperties
                          }
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-2 text-[11px] tracking-[0.14em] uppercase transition-all duration-300 ${
        active
          ? "border-terracotta bg-terracotta text-cream"
          : "border-line bg-white/55 text-ink-soft hover:border-terracotta/50 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
