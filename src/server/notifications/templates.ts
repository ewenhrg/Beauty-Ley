import { salon } from "@/data/salon";
import { getSiteUrl } from "@/lib/site";
import type { AppointmentRow, CustomerRow, ServiceRow, StaffRow } from "../db/types";
import { formatDateKey, formatDuration, instantToWall, minutesToLabel } from "@/lib/time";

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
  return `${formatDateKey(wall.dateKey)} à ${minutesToLabel(wall.minutes)}`;
}

function summary(context: NotificationContext) {
  const { appointment, service, staff } = context;
  return [
    `Prestation : ${service.name}`,
    `Avec : ${staff.first_name}`,
    `Quand : ${when(appointment)}`,
    `Durée : ${formatDuration(appointment.duration_min)}`,
    `Prix : ${service.price_kind === "from" ? "à partir de " : ""}${appointment.price} EGP`,
    `Référence : ${appointment.reference}`,
  ].join("\n");
}

export function buildStaffAlert(kind: NotificationKind, context: NotificationContext) {
  const { appointment, customer, service, staff } = context;
  const whenLabel = when(appointment);
  const client = `${customer.first_name} ${customer.last_name}`.trim();
  const calendarUrl = `${getSiteUrl()}/admin/calendrier`;
  const details = [
    `Prestation : ${service.name}`,
    `Avec : ${staff.first_name}`,
    `Quand : ${whenLabel}`,
    `Cliente : ${client}`,
    customer.phone ? `Tél : ${customer.phone}` : null,
    `Réf : ${appointment.reference}`,
    "",
    `Planning : ${calendarUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  switch (kind) {
    case "cancellation":
      return {
        title: `RDV annulé - ${whenLabel}`,
        body: [`${client} a annulé.`, "", details].join("\n"),
      };
    case "reschedule":
      return {
        title: `RDV déplacé - ${whenLabel}`,
        body: [`Nouveau créneau pour ${client}.`, "", details].join("\n"),
      };
    default:
      return {
        title: `Nouveau RDV - ${whenLabel}`,
        body: details,
      };
  }
}

export function buildEmail(kind: NotificationKind, context: NotificationContext) {
  const { customer, appointment, manageUrl, cancellationWindowHours } = context;
  const hello = `Bonjour ${customer.first_name},`;
  const footer = [
    "",
    `Gérer ou annuler votre rendez-vous : ${manageUrl}`,
    `Annulation gratuite jusqu'à ${cancellationWindowHours} h avant le créneau.`,
    "",
    `${salon.name} — ${salon.tagline}, ${salon.city}`,
  ].join("\n");

  switch (kind) {
    case "confirmation":
      return {
        subject: `Votre rendez-vous ${salon.name} — ${when(appointment)}`,
        body: [hello, "", "Votre rendez-vous est confirmé.", "", summary(context), footer].join("\n"),
      };
    case "reminder":
      return {
        subject: `Rappel : votre rendez-vous ${salon.name} ${when(appointment)}`,
        body: [
          hello,
          "",
          "Petit rappel de votre rendez-vous.",
          "",
          summary(context),
          footer,
        ].join("\n"),
      };
    case "reschedule":
      return {
        subject: `Votre rendez-vous ${salon.name} a été déplacé`,
        body: [
          hello,
          "",
          "Votre rendez-vous a bien été déplacé. Voici les nouvelles informations.",
          "",
          summary(context),
          footer,
        ].join("\n"),
      };
    case "cancellation":
      return {
        subject: `Annulation de votre rendez-vous ${salon.name}`,
        body: [
          hello,
          "",
          `Votre rendez-vous du ${when(appointment)} a bien été annulé.`,
          "",
          `Référence : ${appointment.reference}`,
          "",
          "Au plaisir de vous revoir très bientôt.",
          "",
          `${salon.name} — ${salon.tagline}, ${salon.city}`,
        ].join("\n"),
      };
  }
}
