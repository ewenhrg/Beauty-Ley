import { salon } from "@/data/salon";
import type { AppointmentDto } from "./booking-types";

function stamp(date: Date) {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

function endOf(appointment: AppointmentDto) {
  return new Date(Date.parse(appointment.startAt) + appointment.duration * 60_000);
}

function title(appointment: AppointmentDto) {
  return `${appointment.serviceName} — ${salon.name}`;
}

function description(appointment: AppointmentDto) {
  return [
    `Avec ${appointment.staffName}`,
    `Référence ${appointment.reference}`,
    appointment.manageUrl,
  ].join(" · ");
}

/** RFC 5545 calendar file, offered as a download from the confirmation page. */
export function buildIcs(appointment: AppointmentDto) {
  const start = new Date(appointment.startAt);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Beauty Ley//Reservation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.reference}@beautyley`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(endOf(appointment))}`,
    `SUMMARY:${title(appointment)}`,
    `DESCRIPTION:${description(appointment)}`,
    `LOCATION:${salon.name}, ${salon.city}, ${salon.country}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function icsDataUrl(appointment: AppointmentDto) {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(appointment))}`;
}

export function googleCalendarUrl(appointment: AppointmentDto) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(appointment),
    dates: `${stamp(new Date(appointment.startAt))}/${stamp(endOf(appointment))}`,
    details: description(appointment),
    location: `${salon.name}, ${salon.city}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
