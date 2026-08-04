import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

export interface NotificationContent {
  title: string;

  message: string;
}

export function buildNotificationContent(
  event: ProviderEvent,
  previous: EventWithGame | null
): NotificationContent {
  if (!previous) {
    return {
      title: `${event.title} is now ${event.status}`,

      message: `${event.title} just appeared with status ${event.status}.`,
    };
  }

  return {
    title: `${event.title} is now ${event.status}`,

    message: `${event.title} changed from ${previous.status} to ${event.status}.`,
  };
}
