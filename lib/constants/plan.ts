export const PLANS = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

// Free tier's watchlist cap — see docs/06_DECISIONS.md ADR-041.
// Existing watchlists above this count are grandfathered (never
// deleted), only new additions past the cap are blocked.
export const FREE_WATCHLIST_LIMIT = 5;

export const BILLING_INTERVALS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
  LIFETIME: "lifetime",
} as const;

export type BillingInterval =
  (typeof BILLING_INTERVALS)[keyof typeof BILLING_INTERVALS];

// $49/year vs. $4.99 x 12 = $59.88/year — genuinely at least "2 months
// free" (10 x $4.99 = $49.90, and the actual price is even a cent
// under that), not a rounded-up marketing claim. Lifetime ($99) is a
// one-time Paddle transaction, not a subscription — pays for itself
// vs. yearly in exactly 2 years. See docs/06_DECISIONS.md ADR-041
// (yearly/lifetime addendum) and ADR-066. Must match the price
// entities in the Paddle catalog.
export const PREMIUM_MONTHLY_PRICE_USD = 4.99;
export const PREMIUM_YEARLY_PRICE_USD = 49;
export const PREMIUM_LIFETIME_PRICE_USD = 99;

// Sentinel stored in User.subscriptionStatus for a lifetime purchase —
// distinct from ACTIVE_SUBSCRIPTION_STATUSES (below), which is
// Paddle's own *subscription* status vocabulary. A lifetime purchase
// is a one-time transaction (revoked by a refund adjustment), handled
// separately in billing.service.ts.
export const SUBSCRIPTION_STATUS_LIFETIME = "lifetime";

// Stored when a lifetime purchase is refunded or charged back.
export const SUBSCRIPTION_STATUS_REFUNDED = "refunded";

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Free",
  PREMIUM: "Premium",
};

// Subscription statuses that still mean "has Premium access" — mirrors
// Paddle's subscription status enum (active | trialing | past_due |
// paused | canceled). Unlike Lemon Squeezy, a Paddle subscription that
// the customer cancels stays `active` (with a scheduled change) until
// the paid period ends, and only then becomes `canceled` — so
// `canceled` correctly means "no access". `past_due` keeps access
// while Paddle retries the card.
export const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);
