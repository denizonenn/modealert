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
// one-time Lemon Squeezy order, not a subscription — pays for itself
// vs. yearly in exactly 2 years. See docs/06_DECISIONS.md ADR-041
// (yearly/lifetime addendum).
export const PREMIUM_MONTHLY_PRICE_USD = 4.99;
export const PREMIUM_YEARLY_PRICE_USD = 49;
export const PREMIUM_LIFETIME_PRICE_USD = 99;

// Sentinel stored in User.subscriptionStatus for a lifetime purchase —
// distinct from ACTIVE_SUBSCRIPTION_STATUSES (below), which is
// Lemon Squeezy's own *subscription* status vocabulary. A one-time
// lifetime order uses a different status vocabulary entirely ("paid",
// "refunded", …), handled separately in billing.service.ts's
// order-webhook path.
export const SUBSCRIPTION_STATUS_LIFETIME = "lifetime";

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Free",
  PREMIUM: "Premium",
};

// Subscription statuses that still mean "has Premium access" — mirrors
// Lemon Squeezy's subscription status enum. `cancelled` keeps access
// until the paid period actually ends (Lemon Squeezy still reports it
// as `cancelled` during that window, then moves it to `expired`).
export const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "on_trial",
  "active",
  "past_due",
  "cancelled",
]);
