import { getStore } from "../db";
import type { NotificationRow } from "../db/types";
import { newId } from "../ids";
import { getEmailProvider, getSmsProvider, getWhatsappProvider } from "./providers";
import type { MessageProvider } from "./providers";
import { buildEmail } from "./templates";
import type { NotificationContext, NotificationKind } from "./templates";

export type { NotificationContext, NotificationKind } from "./templates";

function providerFor(channel: NotificationRow["channel"]): MessageProvider | null {
  switch (channel) {
    case "email":
      return getEmailProvider();
    case "sms":
      return getSmsProvider();
    case "whatsapp":
      return getWhatsappProvider();
  }
}

/**
 * Writes the message to the outbox, then tries to deliver it. Delivery failures
 * never break the booking: the row keeps the error so the salon can retry.
 */
export async function dispatch(options: {
  appointmentId: string | null;
  channel: NotificationRow["channel"];
  kind: NotificationKind;
  recipient: string;
  subject: string | null;
  body: string;
}) {
  const store = getStore();
  const row: NotificationRow = {
    id: newId("ntf"),
    appointment_id: options.appointmentId,
    channel: options.channel,
    kind: options.kind,
    recipient: options.recipient,
    subject: options.subject,
    body: options.body,
    status: "queued",
    error: null,
    created_at: new Date().toISOString(),
    sent_at: null,
  };
  await store.insert("notifications", [row]);

  const provider = providerFor(options.channel);
  if (!provider) {
    await store.update("notifications", row.id, {
      status: "skipped",
      error: `Aucun fournisseur ${options.channel} configuré.`,
    });
    return { ...row, status: "skipped" as const };
  }

  const result = await provider.send({
    to: options.recipient,
    subject: options.subject ?? "",
    body: options.body,
  });

  await store.update("notifications", row.id, {
    status: result.status,
    error: result.status === "sent" ? null : result.error,
    sent_at: result.status === "sent" ? new Date().toISOString() : null,
  });
  return { ...row, status: result.status };
}

/** High-level entry point used by the booking service. */
export async function notifyAppointment(kind: NotificationKind, context: NotificationContext) {
  if (!context.customer.email) return null;
  const { subject, body } = buildEmail(kind, context);
  return dispatch({
    appointmentId: context.appointment.id,
    channel: "email",
    kind,
    recipient: context.customer.email,
    subject,
    body,
  });
}

export async function listNotifications(limit = 100) {
  return getStore().select("notifications", {
    order: { column: "created_at", ascending: false },
    limit,
  });
}

export async function hasReminderBeenSent(appointmentId: string) {
  const rows = await getStore().select("notifications", {
    eq: { appointment_id: appointmentId, kind: "reminder" },
    limit: 1,
  });
  return rows.length > 0;
}

/** Reports which channels are actually wired up, for the admin settings page. */
export function notificationStatus() {
  return {
    email: getEmailProvider()?.name ?? null,
    sms: getSmsProvider()?.name ?? null,
    whatsapp: getWhatsappProvider()?.name ?? null,
  };
}
