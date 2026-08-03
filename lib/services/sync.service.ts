import type { ComparisonResult } from "@/lib/scheduler/event-comparator";

import { upsertEvent } from "@/lib/repositories/event.repository";

import { notificationService } from "./notification.service";

import { watchlistService } from "./watchlist.service";

export const syncService = {
  async sync(result: ComparisonResult) {
    const {
      newEvents,
      updatedEvents,
    } = result;

    /*
     * New events
     */

    for (const event of newEvents) {
      await upsertEvent(event);

      console.log(
        `[SYNC] Created ${event.title}`
      );
    }

    /*
     * Updated events
     */

    for (const event of updatedEvents) {
      await upsertEvent(event);

      console.log(
        `[SYNC] Updated ${event.title}`
      );

      const watchlists =
        await watchlistService.getByEvent(
          event.id
        );

      for (const watchlist of watchlists) {
        await notificationService.create({
          userId: watchlist.userId,
          eventId: event.id,
          title: event.title,
          message: `${event.title} is now ${event.status}`,
          channel: "IN_APP",
        });
      }
    }
  },
};