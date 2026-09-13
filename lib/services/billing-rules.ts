import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  PLANS,
  type Plan,
} from "@/lib/constants/plan";

// Pure billing decisions, kept free of Prisma/Paddle imports so they
// can be unit-tested directly (see billing-rules.test.ts). The service
// layer (billing.service.ts) does the I/O around them.

// Whether a Paddle subscription status grants Premium right now.
// `active` and `trialing` do; so does `past_due` while Paddle retries
// the card. A scheduled cancel or pause does NOT revoke access — Paddle
// keeps such a subscription `active` (with `scheduled_change` set)
// until the period ends, and only then moves it to `canceled`/`paused`.
// So this deliberately looks at `status` alone, never at
// `scheduled_change`.
export function planForSubscriptionStatus(status: string): Plan {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status)
    ? PLANS.PREMIUM
    : PLANS.FREE;
}

interface PurchasedItem {
  price: { id: string } | null;
}

// A transaction is a lifetime purchase only when it isn't a
// subscription payment and contains the configured lifetime price.
export function isLifetimePurchase(
  transaction: { subscriptionId: string | null; items: PurchasedItem[] },
  lifetimePriceId: string
): boolean {
  return (
    lifetimePriceId !== "" &&
    transaction.subscriptionId === null &&
    transaction.items.some((item) => item.price?.id === lifetimePriceId)
  );
}

// Only an approved, full refund or chargeback on a one-time purchase
// takes back lifetime access — a partial refund (goodwill credit) or a
// pending/rejected adjustment leaves it in place.
export function shouldRevokeLifetime(adjustment: {
  status: string;
  type: string;
  action: string;
  subscriptionId: string | null;
}): boolean {
  return (
    adjustment.status === "approved" &&
    adjustment.type === "full" &&
    adjustment.subscriptionId === null &&
    (adjustment.action === "refund" || adjustment.action === "chargeback")
  );
}

// Is this request allowed to reach the webhook handler? `allowedCidrs`
// comes from Paddle's own /ips endpoint and every entry is a /32, so a
// match is an exact address comparison.
export function isAllowedWebhookIp(
  ip: string | null,
  allowedCidrs: string[]
): boolean {
  if (!ip) {
    return false;
  }

  return allowedCidrs.some((cidr) => cidr.split("/")[0] === ip);
}
