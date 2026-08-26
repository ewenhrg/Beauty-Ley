import { getSiteUrl } from "@/lib/site";

export type OutgoingMessage = {
  to: string;
  subject: string;
  body: string;
};

export type DeliveryResult =
  | { status: "sent" }
  | { status: "failed"; error: string }
  | { status: "skipped"; error: string };

export interface MessageProvider {
  readonly channel: "email" | "sms" | "whatsapp";
  readonly name: string;
  send(message: OutgoingMessage): Promise<DeliveryResult>;
}

/**
 * Resend adapter. Enabled as soon as RESEND_API_KEY and NOTIFICATION_FROM are
 * set — no code change needed.
 */
class ResendProvider implements MessageProvider {
  readonly channel = "email" as const;
  readonly name = "resend";

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: OutgoingMessage): Promise<DeliveryResult> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          text: message.body,
        }),
      });
      if (!response.ok) {
        return { status: "failed", error: `Resend ${response.status}: ${await response.text()}` };
      }
      return { status: "sent" };
    } catch (error) {
      return { status: "failed", error: error instanceof Error ? error.message : String(error) };
    }
  }
}

/**
 * Returns the configured email provider, or null when none is set up. Nothing
 * is ever simulated: without a provider the message is stored with the
 * `skipped` status so the salon can see exactly what was not sent.
 */
export function getEmailProvider(): MessageProvider | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.NOTIFICATION_FROM?.trim();
  if (apiKey && from) return new ResendProvider(apiKey, from);
  return null;
}

/**
 * SMS and WhatsApp are not wired to a gateway yet. Implement `MessageProvider`
 * here (Twilio, Vonage, WhatsApp Cloud API…) and return it — the outbox,
 * templates and admin views already handle those channels.
 */
export function getSmsProvider(): MessageProvider | null {
  return null;
}

export function getWhatsappProvider(): MessageProvider | null {
  return null;
}

/** Phone push via ntfy (https://ntfy.sh). Staff subscribe to NTFY_TOPIC. */
class NtfyProvider implements MessageProvider {
  readonly channel = "sms" as const;
  readonly name = "ntfy";

  constructor(
    private readonly server: string,
    private readonly topic: string,
  ) {}

  async send(message: OutgoingMessage): Promise<DeliveryResult> {
    try {
      const response = await fetch(this.server, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: this.topic,
          title: message.subject.slice(0, 120),
          message: message.body,
          priority: 4,
          tags: ["nail_care", "calendar"],
          click: staffCalendarUrl(),
        }),
      });
      if (!response.ok) {
        return { status: "failed", error: `ntfy ${response.status}: ${await response.text()}` };
      }
      return { status: "sent" };
    } catch (error) {
      return { status: "failed", error: error instanceof Error ? error.message : String(error) };
    }
  }
}

class TelegramProvider implements MessageProvider {
  readonly channel = "whatsapp" as const;
  readonly name = "telegram";

  constructor(
    private readonly token: string,
    private readonly chatId: string,
  ) {}

  async send(message: OutgoingMessage): Promise<DeliveryResult> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: `${message.subject}\n\n${message.body}`,
          disable_web_page_preview: true,
        }),
      });
      if (!response.ok) {
        return {
          status: "failed",
          error: `Telegram ${response.status}: ${await response.text()}`,
        };
      }
      return { status: "sent" };
    } catch (error) {
      return { status: "failed", error: error instanceof Error ? error.message : String(error) };
    }
  }
}

function staffCalendarUrl() {
  return `${getSiteUrl()}/admin/calendrier`;
}

export function getNtfyProvider(topic = ntfyTopic()): MessageProvider | null {
  if (!topic) return null;
  const server = (process.env.NTFY_SERVER?.trim() || "https://ntfy.sh").replace(/\/$/, "");
  return new NtfyProvider(server, topic);
}

export function getTelegramProvider(): MessageProvider | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return null;
  return new TelegramProvider(token, chatId);
}

export function ntfyTopic(): string | null {
  return process.env.NTFY_TOPIC?.trim() || null;
}

export function ntfyTopicSlug(username: string) {
  return username.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

/** One ntfy subject per team login, derived from the shared base topic. */
export function ntfyTopicForUser(username: string): string | null {
  const base = ntfyTopic();
  if (!base) return null;
  return `${base}-${ntfyTopicSlug(username)}`;
}

export function ntfySubscribeUrl(topic = ntfyTopic()): string | null {
  if (!topic) return null;
  const server = (process.env.NTFY_SERVER?.trim() || "https://ntfy.sh").replace(/\/$/, "");
  return `${server}/${encodeURIComponent(topic)}`;
}
