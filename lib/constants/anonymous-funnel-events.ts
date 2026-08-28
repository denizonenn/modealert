// A separate, smaller allowlist from ANALYTICS_EVENTS on purpose —
// these are the only two events ever recorded with no user and no
// visitor identifier attached, so keeping them in their own list
// makes it obvious at a glance that nothing here can be linked back
// to a person. See docs/06_DECISIONS.md ADR-056.
export const ANONYMOUS_FUNNEL_EVENTS = {
  LANDING_PAGE_VIEWED: "landing_page_viewed",
  SIGNUP_PAGE_VIEWED: "signup_page_viewed",
} as const;

export type AnonymousFunnelEventName =
  (typeof ANONYMOUS_FUNNEL_EVENTS)[keyof typeof ANONYMOUS_FUNNEL_EVENTS];

export const ANONYMOUS_FUNNEL_EVENT_LABELS: Record<
  AnonymousFunnelEventName,
  string
> = {
  landing_page_viewed: "Landing page viewed",
  signup_page_viewed: "Signup page viewed",
};

export const ANONYMOUS_FUNNEL_EVENT_ORDER: AnonymousFunnelEventName[] = [
  "landing_page_viewed",
  "signup_page_viewed",
];
