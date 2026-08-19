import {
  getProviders,
} from "@/lib/providers/core/registry";

import {
  eventSyncService,
} from "@/lib/services/event-sync.service";

import {
  createHealthCheck,
} from "@/lib/repositories/provider-health-check.repository";

import { checkAndAlert } from "@/lib/services/health-alert.service";

import {
  summarizeSyncResults,
  type ProviderSyncOutcome,
} from "@/lib/services/provider-sync-summarize";

export const providerSyncService = {
  async syncAll() {
    const syncStartedAt =
      Date.now();

    const providers =
      getProviders();

    const results =
      await Promise.allSettled(
        providers.map(
          async (provider): Promise<ProviderSyncOutcome> => {
            if (
              !provider.enabled
            ) {
              return {
                provider:
                  provider.name,

                skipped: true,
              };
            }

            const startedAt =
              Date.now();

            try {
              const events =
                await provider.getEvents();

              const latencyMs =
                Date.now() - startedAt;

              await createHealthCheck({
                providerId: provider.id,
                healthy: true,
                latencyMs,
              });

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
              const latencyMs =
                Date.now() - startedAt;

              const message =
                error instanceof Error
                  ? error.message
                  : "Unknown error";

              await createHealthCheck({
                providerId: provider.id,
                healthy: false,
                latencyMs,
                error: message,
              });

              await checkAndAlert(
                provider.id,
                provider.name
              );

              console.error(
                `[ProviderSync] ${provider.name} failed:`,
                error
              );

              throw error;
            }
          }
        )
      );

    const providerResults =
      summarizeSyncResults(
        providers.map(
          (provider) => provider.name
        ),
        results
      );

    return {
      results: providerResults,

      durationMs:
        Date.now() -
        syncStartedAt,
    };
  },
};