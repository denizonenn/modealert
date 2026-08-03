import {
  getProviders,
} from "@/lib/providers/core/registry";

import {
  eventSyncService,
} from "@/lib/services/event-sync.service";

export const providerSyncService = {
  async syncAll() {
    const providers =
      getProviders();

    const results =
      await Promise.allSettled(
        providers.map(
          async (provider) => {
            if (
              !provider.enabled
            ) {
              return {
                provider:
                  provider.name,

                skipped: true,
              };
            }

            const events =
              await provider.getEvents();

            const saved =
              await eventSyncService.sync(
                events
              );

            return {
              provider:
                provider.name,

              received:
                events.length,

              saved:
                saved.length,
            };
          }
        )
      );

    return results;
  },
};