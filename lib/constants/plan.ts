export const PLANS = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

// Free tier's watchlist cap — see docs/06_DECISIONS.md ADR-041.
// Existing watchlists above this count are grandfathered (never
// deleted), only new additions past the cap are blocked.
export const FREE_WATCHLIST_LIMIT = 5;

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
