import {
  upsertEvent,
} from "@/lib/repositories/event.repository";

import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import {
  eventHistoryService,
} from "@/lib/services/event-history.service";

import {
  eventChangeHandlerService,
} from "@/lib/services/event-change-handler.service";

export const eventSyncService = {
  async sync(
    events: ProviderEvent[]
  ) {
    const results =
      await Promise.all(
        events.map(async (event) => {
          await eventChangeHandlerService.handle(
            event
          );

          const saved =
            await upsertEvent(event);

          if (
            event.status ===
            "TRACKING"
          ) {
            await eventHistoryService.start(
              event.id,
              event.status
            );
          } else {
            await eventHistoryService.finish(
              event.id
            );
          }

          return saved;
        })
      );

    return results;
  },
};