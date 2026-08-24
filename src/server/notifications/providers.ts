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
