import { getStore } from "../db";
import type { AdminUserRow, NotificationRow, StaffRow } from "../db/types";
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
import { staffDisplayName } from "../repo/catalog";
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
 * Pushes when you assign someone in admin. Goes to that person's ntfy subject
 * (account username) and also to the salon subject phones already listen to,
 * so the alert is not lost if they have not switched topics yet.
 */
export async function notifyStaff(kind: NotificationKind, context: NotificationContext) {
  if (kind === "reminder") return;
  const alert = buildStaffAlert(kind, context);

  let users: AdminUserRow[] = [];
  try {
    users = (await listUsers()).filter(
      (user) => user.active && accountMatchesStaff(user, context.staff),
    );
  } catch (error) {
    console.error("[staff-notify] could not load team accounts", error);
  }

  const topics = new Map<string, string>();
  for (const user of users) {
    const personal = ntfyTopicForUser(user.username);
    if (personal) topics.set(personal, user.username);
  }
  const shared = ntfyTopic();
  if (shared) {
    topics.set(shared, users[0]?.username ?? "équipe (ntfy)");
  }

  if (!topics.size) {
    console.error("[staff-notify] NTFY_TOPIC is not set; nothing to send");
    return;
  }

  for (const [topic, recipient] of topics) {
    const ntfy = getNtfyProvider(topic);
    if (!ntfy) continue;
    await dispatch({
      appointmentId: context.appointment.id,
      channel: "sms",
      kind,
      recipient,
      subject: alert.title,
      body: alert.body,
      provider: ntfy,
    });
  }
}

function accountMatchesStaff(user: AdminUserRow, staff: StaffRow) {
  if (user.staff_id === staff.id) return true;
  const staffKey = fold(staffDisplayName(staff));
  const first = fold(staff.first_name);
  const username = fold(user.username);
  const display = fold(user.display_name);
  return username === first || username === staffKey || display === first || display === staffKey;
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
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
