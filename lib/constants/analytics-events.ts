// The only event names the tracking endpoint accepts — an allowlist,
// not free text, so `/api/analytics/event` can't become a place to
// stash arbitrary strings. Each one maps to a real funnel question
// Deniz asked (see docs/06_DECISIONS.md ADR-046): where do people
// drop off in onboarding, does the free-plan limit get hit, does a
// checkout click turn into a real subscription.
export const ANALYTICS_EVENTS = {
  ONBOARDING_STEP_VIEWED: "onboarding_step_viewed",
  ONBOARDING_FINISHED: "onboarding_finished",
  WATCHLIST_LIMIT_HIT: "watchlist_limit_hit",
  SIGNUP_COMPLETED: "signup_completed",
  CHECKOUT_CLICKED: "checkout_clicked",
  PREMIUM_ACTIVATED: "premium_activated",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export const ANALYTICS_EVENT_LABELS: Record<AnalyticsEventName, string> = {
  onboarding_step_viewed: "Onboarding step viewed",
  onboarding_finished: "Onboarding finished",
  watchlist_limit_hit: "Free limit hit",
  signup_completed: "Signup completed",
  checkout_clicked: "Checkout clicked",
  premium_activated: "Premium activated",
};

// Display order for the funnel view — roughly the order a user moves
// through it, not alphabetical.
export const ANALYTICS_FUNNEL_ORDER: AnalyticsEventName[] = [
  "signup_completed",
  "onboarding_step_viewed",
  "onboarding_finished",
  "watchlist_limit_hit",
  "checkout_clicked",
  "premium_activated",
];
