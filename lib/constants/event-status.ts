export const EVENT_STATUS = {
  LIVE: "LIVE",

  UPCOMING: "UPCOMING",

  TRACKING: "TRACKING",

  ENDED: "ENDED",
} as const;

export type EventStatus =
  (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];