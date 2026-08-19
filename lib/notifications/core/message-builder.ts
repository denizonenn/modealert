import type {
  ProviderEvent,
  ProviderEventStatus,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

import { gameName } from "@/lib/constants/games";

export interface NotificationContent {
  title: string;

  message: string;
}

// Raw status codes ("ENDED", "TRACKING") are how the DB stores it and
// how badges read in-app next to a status colour, but a bare email
// subject line has no such context — "is now TRACKING" doesn't tell
// anyone what actually happened.
const STATUS_HEADLINE: Record<ProviderEventStatus, string> = {
  LIVE: "is live now",
  UPCOMING: "is coming up",
  TRACKING: "is winding down",
  ENDED: "has ended",
};

const STATUS_PHRASE: Record<ProviderEventStatus, string> = {
  LIVE: "live",
  UPCOMING: "upcoming",
  TRACKING: "winding down",
  ENDED: "ended",
};

export function buildNotificationContent(
  event: ProviderEvent,
  previous: EventWithGame | null
): NotificationContent {
  // A user can track events across all 13 games, so a notification
  // that only names the event ("ACT IV has ended") leaves them
  // guessing which game it belongs to — confirmed against a real
  // sent notification in production, 2026-08-19.
  const game = previous?.game?.name ?? gameName(event.gameId);

  const status = event.status as ProviderEventStatus;

  const title = `${game}: ${event.title} ${
    STATUS_HEADLINE[status] ?? `is now ${event.status}`
  }`;

  if (!previous) {
    return {
      title,

      message: `${event.title} (${game}) is now being tracked — currently ${
        STATUS_PHRASE[status] ?? event.status
      }.`,
    };
  }

  const previousStatus = previous.status as ProviderEventStatus;

  return {
    title,

    message: `${event.title} (${game}) went from ${
      STATUS_PHRASE[previousStatus] ?? previous.status
    } to ${STATUS_PHRASE[status] ?? event.status}.`,
  };
}
