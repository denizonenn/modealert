import {
  Environment,
  LogLevel,
  Paddle,
  type EventEntity,
} from "@paddle/paddle-node-sdk";

import { env } from "@/lib/config/env";
import { BILLING_INTERVALS, type BillingInterval } from "@/lib/constants/plan";

export type PaddleEnvironment = "sandbox" | "production";

// Never defaulted: an unset or misspelled PADDLE_ENVIRONMENT throws
// instead of quietly picking one, so the app can't run sandbox
// credentials against production (or the reverse). Only reached once
// some other Paddle var is actually set — see isCheckoutConfigured.
function paddleEnvironment(): PaddleEnvironment {
  const value = env.PADDLE_ENVIRONMENT;

  if (value !== "sandbox" && value !== "production") {
    throw new Error(
      `PADDLE_ENVIRONMENT must be "sandbox" or "production", got "${value}"`
    );
  }

  return value;
}

export function priceIdFor(interval: BillingInterval): string {
  switch (interval) {
    case BILLING_INTERVALS.YEARLY:
      return env.PADDLE_PRICE_ID_YEARLY;
    case BILLING_INTERVALS.LIFETIME:
      return env.PADDLE_PRICE_ID_LIFETIME;
    default:
      return env.PADDLE_PRICE_ID_MONTHLY;
  }
}

export function isLifetimePriceId(priceId: string | undefined): boolean {
  return (
    env.PADDLE_PRICE_ID_LIFETIME !== "" &&
    priceId === env.PADDLE_PRICE_ID_LIFETIME
  );
}

// No token/price configured yet — same "disabled until Deniz provides
// real credentials" pattern as Resend/Google OAuth (see
// docs/06_DECISIONS.md ADR-003/ADR-005). Checkout stays hidden, not
// broken. Each interval can go live independently.
export function isCheckoutConfigured(
  interval: BillingInterval = BILLING_INTERVALS.MONTHLY
): boolean {
  return env.PADDLE_CLIENT_TOKEN !== "" && priceIdFor(interval) !== "";
}

export function isWebhookConfigured(): boolean {
  return env.PADDLE_WEBHOOK_SECRET !== "" && env.PADDLE_API_KEY !== "";
}

export function isApiConfigured(): boolean {
  return env.PADDLE_API_KEY !== "";
}

// What the pricing page's client component needs to open Paddle's
// overlay checkout — only public values (client token, price ids).
export function getClientCheckoutSettings() {
  return {
    token: env.PADDLE_CLIENT_TOKEN,
    environment: paddleEnvironment(),
  };
}

let paddle: Paddle | null = null;

function getPaddle(): Paddle {
  if (!paddle) {
    paddle = new Paddle(env.PADDLE_API_KEY, {
      environment:
        paddleEnvironment() === "production"
          ? Environment.production
          : Environment.sandbox,
      logLevel: LogLevel.error,
    });
  }

  return paddle;
}

// Verifies the `Paddle-Signature` header against the raw body and
// returns the typed event. Throws on a bad signature, a stale
// timestamp, or a malformed payload — the webhook route turns any
// throw into a non-2xx so Paddle retries (a rotated secret that
// hasn't been redeployed yet recovers on its own that way).
export function unmarshalWebhook(
  rawBody: string,
  signature: string
): Promise<EventEntity> {
  return getPaddle().webhooks.unmarshal(
    rawBody,
    env.PADDLE_WEBHOOK_SECRET,
    signature
  );
}

// Needed to revoke a lifetime purchase on refund: an adjustment event
// only carries the transaction id, not the custom_data (our user id)
// or the price that was bought.
export async function getTransaction(transactionId: string) {
  return getPaddle().transactions.get(transactionId);
}

// Used by the "Manage subscription" link in /dashboard/settings — the
// portal itself (cancel/update card/invoices) is hosted by Paddle.
// Sessions are short-lived, so a fresh one is created per page view.
export async function getCustomerPortalUrl(
  customerId: string,
  subscriptionId: string | null
): Promise<string | null> {
  if (!isApiConfigured()) {
    return null;
  }

  try {
    const session = await getPaddle().customerPortalSessions.create(
      customerId,
      subscriptionId ? [subscriptionId] : []
    );

    return session.urls.general.overview;
  } catch {
    return null;
  }
}

// Called when a ModeAlert account is deleted — without this, a
// Premium user who deletes their account would keep getting charged
// with no account left to manage it from. Cancels at the end of the
// paid period (the same "access until period end, no prorated refund"
// behavior as a self-service cancel from the portal); the 7-day refund
// policy in /terms covers the edge case where that's not fast enough.
// Best-effort — a failure here shouldn't block the deletion itself.
export async function cancelSubscription(
  subscriptionId: string
): Promise<boolean> {
  if (!isApiConfigured()) {
    return false;
  }

  try {
    await getPaddle().subscriptions.cancel(subscriptionId, {
      effectiveFrom: "next_billing_period",
    });

    return true;
  } catch {
    return false;
  }
}
