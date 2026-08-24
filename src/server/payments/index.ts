import type { SettingsRow } from "../db/types";

/**
 * Payment architecture. Today every appointment is settled on site, which is
 * how the studio works. The pieces below are what a Stripe integration would
 * plug into — deliberately no simulated charge anywhere.
 *
 * To enable online payment later:
 *  1. set STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET,
 *  2. implement `createCheckoutSession` with the Stripe SDK,
 *  3. switch `payment_mode` to `deposit` or `full` in the admin settings,
 *  4. add a webhook route that flips `payment_status` to PAID.
 */

export type PaymentPlan = {
  mode: SettingsRow["payment_mode"];
  /** Amount due online, in EGP. Zero when the client pays on site. */
  amountDue: number;
  label: string;
};

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** Payment modes the salon can actually select right now. */
export function availablePaymentModes(): SettingsRow["payment_mode"][] {
  return isStripeConfigured() ? ["onsite", "deposit", "full"] : ["onsite"];
}

export function planFor(price: number, settings: SettingsRow): PaymentPlan {
  const mode = availablePaymentModes().includes(settings.payment_mode)
    ? settings.payment_mode
    : "onsite";

  if (mode === "full") {
    return { mode, amountDue: price, label: "Paiement intégral en ligne" };
  }
  if (mode === "deposit") {
    const amountDue = Math.round((price * settings.deposit_percent) / 100);
    return { mode, amountDue, label: `Acompte de ${settings.deposit_percent} %` };
  }
  return { mode, amountDue: 0, label: "Paiement sur place" };
}

export class PaymentNotConfiguredError extends Error {
  constructor() {
    super("Le paiement en ligne n'est pas configuré.");
    this.name = "PaymentNotConfiguredError";
  }
}

export async function createCheckoutSession(): Promise<never> {
  throw new PaymentNotConfiguredError();
}
