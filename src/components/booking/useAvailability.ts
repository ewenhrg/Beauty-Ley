"use client";

import { useEffect, useState } from "react";
import { BookingApiError, fetchAvailability, fetchSlots } from "@/lib/booking-client";
import type { DayDto, SlotDto } from "@/lib/booking-types";
import { calendarWindow } from "./BookingCalendar";

/**
 * Both hooks below key their result on the request they answered. Loading is
 * derived by comparing that key with the current one, so no state is written
 * synchronously while an effect runs — only from the async callbacks.
 */

type MonthResult = {
  key: string;
  days: Map<string, DayDto>;
  error: string | null;
  maxAdvanceDays: number;
  nextOpenDay: string | null;
};

const emptyMonth: MonthResult = {
  key: "",
  days: new Map(),
  error: null,
  maxAdvanceDays: 60,
  nextOpenDay: null,
};

export function useMonthAvailability(
  serviceId: string | null,
  staffId: string | null,
  monthKey: string,
  /** Bumped after a booking so the calendar reflects the new occupancy. */
  revision = 0,
) {
  const [result, setResult] = useState<MonthResult>(emptyMonth);
  const key = `${serviceId}|${staffId}|${monthKey}|${revision}`;

  useEffect(() => {
    if (!serviceId) return;
    const controller = new AbortController();
    const { from, days } = calendarWindow(monthKey);

    fetchAvailability(
      { serviceId, staffId: staffId ?? undefined, from, days, withNext: true },
      controller.signal,
    )
      .then((response) => {
        setResult({
          key,
          days: new Map(response.days.map((day) => [day.date, day])),
          error: null,
          maxAdvanceDays: response.maxAdvanceDays,
          nextOpenDay: response.nextOpenDay,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          ...emptyMonth,
          key,
          error:
            error instanceof BookingApiError
              ? error.message
              : "Impossible de charger le calendrier.",
        });
      });

    return () => controller.abort();
  }, [key, serviceId, staffId, monthKey]);

  return {
    days: result.key === key ? result.days : new Map<string, DayDto>(),
    loading: result.key !== key,
    error: result.key === key ? result.error : null,
    maxAdvanceDays: result.maxAdvanceDays,
    nextOpenDay: result.key === key ? result.nextOpenDay : null,
  };
}

type SlotResult = {
  key: string;
  slots: SlotDto[];
  error: string | null;
  reason: DayDto["reason"];
  label: string | null;
};

const emptySlots: SlotResult = {
  key: "",
  slots: [],
  error: null,
  reason: null,
  label: null,
};

export function useSlots(
  serviceId: string | null,
  staffId: string | null,
  date: string | null,
  revision = 0,
) {
  const [result, setResult] = useState<SlotResult>(emptySlots);
  const key = serviceId && date ? `${serviceId}|${staffId}|${date}|${revision}` : "";

  useEffect(() => {
    if (!key || !serviceId || !date) return;
    const controller = new AbortController();

    fetchSlots({ serviceId, staffId: staffId ?? undefined, date }, controller.signal)
      .then((response) => {
        setResult({
          key,
          slots: response.slots,
          error: null,
          reason: response.reason,
          label: response.label,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          ...emptySlots,
          key,
          error:
            error instanceof BookingApiError
              ? error.message
              : "Impossible de charger les créneaux.",
        });
      });

    return () => controller.abort();
  }, [key, serviceId, staffId, date]);

  const fresh = result.key === key;
  return {
    slots: fresh ? result.slots : [],
    loading: Boolean(key) && !fresh,
    error: fresh ? result.error : null,
    reason: fresh ? result.reason : null,
    label: fresh ? result.label : null,
  };
}
