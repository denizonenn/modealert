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

            try {
              const events =
                await provider.getEvents();

              const saved =
                await eventSyncService.sync(
                  events,
                  provider.id
                );

              return {
                provider:
                  provider.name,

                received:
                  events.length,

                saved:
                  saved.length,
              };
            } catch (error) {
              console.error(
                `[ProviderSync] ${provider.name} failed:`,
                error
              );

              throw error;
            }
          }
        )
      );

    return results.map(
      (result, index) => {
        if (
          result.status ===
          "fulfilled"
        ) {
          return result.value;
        }

        return {
          provider:
            providers[index].name,

          error:
            result.reason instanceof
            Error
              ? result.reason
                  .message
              : "Unknown error",
        };
      }
    );
  },
};