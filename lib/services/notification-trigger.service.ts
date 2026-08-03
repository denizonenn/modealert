import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

import {
  getNotificationProviders,
} from "@/lib/notifications/core/registry";

import {
  getWatchlistsByEvent,
} from "@/lib/repositories/watchlist.repository";

export const notificationTriggerService = {
  async trigger(
    event: ProviderEvent,
    previous: EventWithGame | null
  ) {
    const watchlists =
      await getWatchlistsByEvent(
        event.id
      );

    if (watchlists.length === 0) {
      return;
    }

    const providers =
      getNotificationProviders();

    for (const provider of providers) {
      await provider.send(
        event,
        previous
      );
    }

    console.log("");

    console.log(
      `Notified ${watchlists.length} users`
    );
  },
};