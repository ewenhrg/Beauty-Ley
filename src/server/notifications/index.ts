import { getStore } from "../db";
import type { NotificationRow } from "../db/types";
import { newId } from "../ids";
import {
  getEmailProvider,
  getNtfyProvider,
  getSmsProvider,
  getTelegramProvider,
  getWhatsappProvider,
  ntfySubscribeUrl,
  ntfyTopic,
  ntfyTopicForUser,
} from "./providers";
import type { MessageProvider } from "./providers";
import { buildEmail, buildStaffAlert } from "./templates";
import type { NotificationContext, NotificationKind } from "./templates";
import { listUsers } from "../repo/users";

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
  provider?: MessageProvider | null;
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

  try {
    await store.insert("notifications", [row]);
  } catch (error) {
    console.error("[notify] outbox insert failed", error);
  }

  const provider = options.provider === undefined ? providerFor(options.channel) : options.provider;
  if (!provider) {
    try {
      await store.update("notifications", row.id, {
        status: "skipped",
        error: `Aucun fournisseur ${options.channel} configuré.`,
      });
    } catch {
      /* outbox row may be missing on older schemas */
    }
    return { ...row, status: "skipped" as const };
  }

  const result = await provider.send({
    to: options.recipient,
    subject: options.subject ?? "",
    body: options.body,
  });

  try {
    await store.update("notifications", row.id, {
      status: result.status,
      error: result.status === "sent" ? null : result.error,
      sent_at: result.status === "sent" ? new Date().toISOString() : null,
    });
  } catch {
    /* ignore */
  }
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

/**
 * Pushes to the team member whose account is linked to this appointment's
 * staff profile. The shared salon topic is never used: a booking only alerts
 * someone after you assign them in admin.
 */
export async function notifyStaff(kind: NotificationKind, context: NotificationContext) {
  if (kind === "reminder") return;
  const alert = buildStaffAlert(kind, context);
  const staffId = context.staff.id;

  let users: Awaited<ReturnType<typeof listUsers>> = [];
  try {
    users = (await listUsers()).filter(
      (user) => user.active && user.staff_id === staffId,
    );
  } catch {
    users = [];
  }

  for (const user of users) {
    const topic = ntfyTopicForUser(user.username);
    const ntfy = topic ? getNtfyProvider(topic) : null;
    if (!ntfy) continue;
    await dispatch({
      appointmentId: context.appointment.id,
      channel: "sms",
      kind,
      recipient: user.username,
      subject: alert.title,
      body: alert.body,
      provider: ntfy,
    });
  }
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
    ntfy: getNtfyProvider()?.name ?? null,
    telegram: getTelegramProvider()?.name ?? null,
    ntfyTopic: ntfyTopic(),
    ntfyUrl: ntfySubscribeUrl(),
  };
}
