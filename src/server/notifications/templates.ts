import { salon } from "@/data/salon";
import { getSiteUrl } from "@/lib/site";
import type { AppointmentRow, CustomerRow, ServiceRow, StaffRow } from "../db/types";
import { formatDuration, instantToWall, minutesToLabel } from "@/lib/time";

export type NotificationKind = "confirmation" | "reminder" | "reschedule" | "cancellation";

export type NotificationContext = {
  appointment: AppointmentRow;
  customer: CustomerRow;
  service: ServiceRow;
  staff: StaffRow;
  manageUrl: string;
  cancellationWindowHours: number;
};

function when(appointment: AppointmentRow) {
  const wall = instantToWall(new Date(appointment.start_at));
  const [year, month, day] = wall.dateKey.split("-").map(Number);
  const dateLabel = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${dateLabel} at ${minutesToLabel(wall.minutes)}`;
}

function summary(context: NotificationContext) {
  const { appointment, service, staff } = context;
  return [
    `Service: ${service.name}`,
    `With: ${staff.first_name}`,
    `When: ${when(appointment)}`,
    `Duration: ${formatDuration(appointment.duration_min)}`,
    `Price: ${service.price_kind === "from" ? "from " : ""}${appointment.price} EGP`,
    `Reference: ${appointment.reference}`,
  ].join("\n");
}

export function buildStaffAlert(kind: NotificationKind, context: NotificationContext) {
  const { appointment, customer, service, staff } = context;
  const whenLabel = when(appointment);
  const client = `${customer.first_name} ${customer.last_name}`.trim();
  const calendarUrl = `${getSiteUrl()}/admin/calendrier`;
  const details = [
    `Service: ${service.name}`,
    `With: ${staff.first_name}`,
    `When: ${whenLabel}`,
    `Client: ${client}`,
    customer.phone ? `Phone: ${customer.phone}` : null,
    `Ref: ${appointment.reference}`,
    "",
    `Calendar: ${calendarUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  switch (kind) {
    case "cancellation":
      return {
        title: `Appointment cancelled - ${whenLabel}`,
        body: [`${client} cancelled.`, "", details].join("\n"),
      };
    case "reschedule":
      return {
        title: `Appointment rescheduled - ${whenLabel}`,
        body: [`New time for ${client}.`, "", details].join("\n"),
      };
    default:
      return {
        title: `New appointment - ${whenLabel}`,
        body: details,
      };
  }
}

export function buildEmail(kind: NotificationKind, context: NotificationContext) {
  const { customer, appointment, manageUrl, cancellationWindowHours } = context;
  const hello = `Hello ${customer.first_name},`;
  const footer = [
    "",
    `Manage or cancel your appointment: ${manageUrl}`,
    `Free cancellation up to ${cancellationWindowHours} hours before the slot.`,
    "",
    `${salon.name} - ${salon.tagline}, ${salon.city}`,
  ].join("\n");

  switch (kind) {
    case "confirmation":
      return {
        subject: `Your ${salon.name} appointment - ${when(appointment)}`,
        body: [hello, "", "Your appointment is confirmed.", "", summary(context), footer].join("\n"),
      };
    case "reminder":
      return {
        subject: `Reminder: your ${salon.name} appointment ${when(appointment)}`,
        body: [
          hello,
          "",
          "This is a reminder of your appointment.",
          "",
          summary(context),
          footer,
        ].join("\n"),
      };
    case "reschedule":
      return {
        subject: `Your ${salon.name} appointment has been rescheduled`,
        body: [
          hello,
          "",
          "Your appointment has been moved. Here are the new details.",
          "",
          summary(context),
          footer,
        ].join("\n"),
      };
    case "cancellation":
      return {
        subject: `Your ${salon.name} appointment has been cancelled`,
        body: [
          hello,
          "",
          `Your appointment on ${when(appointment)} has been cancelled.`,
          "",
          `Reference: ${appointment.reference}`,
          "",
          "We look forward to seeing you again soon.",
          "",
          `${salon.name} - ${salon.tagline}, ${salon.city}`,
        ].join("\n"),
      };
  }
}
