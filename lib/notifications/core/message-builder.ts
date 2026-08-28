import type {
  ProviderEvent,
  ProviderEventStatus,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

import { gameName } from "@/lib/constants/games";
import type { Dictionary } from "@/lib/i18n/load-dictionary";

export interface NotificationContent {
  title: string;

  message: string;
}

// Raw status codes ("ENDED", "TRACKING") are how the DB stores it and
// how badges read in-app next to a status colour, but a bare email
// subject line has no such context — "is now TRACKING" doesn't tell
// anyone what actually happened.
function statusHeadline(
  status: ProviderEventStatus,
  raw: string,
  t: Dictionary["notificationMessages"]
): string {
  switch (status) {
    case "LIVE":
      return t.headlineLive;
    case "UPCOMING":
      return t.headlineUpcoming;
    case "TRACKING":
      return t.headlineTracking;
    case "ENDED":
      return t.headlineEnded;
    default:
      return t.headlineFallback.replace("{status}", raw);
  }
}

function statusPhrase(
  status: ProviderEventStatus,
  raw: string,
  t: Dictionary["notificationMessages"]
): string {
  switch (status) {
    case "LIVE":
      return t.phraseLive;
    case "UPCOMING":
      return t.phraseUpcoming;
    case "TRACKING":
      return t.phraseTracking;
    case "ENDED":
      return t.phraseEnded;
    default:
      return raw;
  }
}

// `dict` is the recipient's own dictionary (from their User.locale),
// resolved once per recipient by the caller — game titles and event
// names stay as the provider supplies them, since those are real
// proper nouns, not translatable copy.
export function buildNotificationContent(
  event: ProviderEvent,
  previous: EventWithGame | null,
  dict: Dictionary
): NotificationContent {
  const t = dict.notificationMessages;

  // A user can track events across all 13 games, so a notification
  // that only names the event ("ACT IV has ended") leaves them
  // guessing which game it belongs to — confirmed against a real
  // sent notification in production, 2026-08-19.
  const game = previous?.game?.name ?? gameName(event.gameId);

  const status = event.status as ProviderEventStatus;

  const title = t.title
    .replace("{game}", game)
    .replace("{event}", event.title)
    .replace("{headline}", statusHeadline(status, event.status, t));

  if (!previous) {
    return {
      title,

      message: t.nowTracked
        .replace("{event}", event.title)
        .replace("{game}", game)
        .replace("{phrase}", statusPhrase(status, event.status, t)),
    };
  }

  const previousStatus = previous.status as ProviderEventStatus;

  return {
    title,

    message: t.statusChanged
      .replace("{event}", event.title)
      .replace("{game}", game)
      .replace(
        "{from}",
        statusPhrase(previousStatus, previous.status, t)
      )
      .replace("{to}", statusPhrase(status, event.status, t)),
  };
}
