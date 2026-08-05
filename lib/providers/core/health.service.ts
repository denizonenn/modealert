import {
  getProviders,
} from "./registry";

function explainError(
  error: unknown
): string {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown error";

  if (
    message.includes("401") ||
    message.includes(
      "Unauthorized"
    )
  ) {
    return (
      "API key expired or invalid — needs manual renewal " +
      "(developer.riotgames.com for Riot/Valorant, " +
      "bungie.net/en/User/API for Destiny 2)"
    );
  }

  return message;
}

export const providerHealthService = {
  async check() {
    const providers =
      getProviders();

    return Promise.all(
      providers.map(
        async (provider) => {
          if (
            !provider.enabled
          ) {
            return {
              id: provider.id,

              name: provider.name,

              enabled: false,

              healthy: null,
            };
          }

          const startedAt =
            Date.now();

          try {
            const events =
              await provider.getEvents();

            return {
              id: provider.id,

              name: provider.name,

              enabled: true,

              healthy: true,

              eventCount:
                events.length,

              latencyMs:
                Date.now() -
                startedAt,
            };
          } catch (error) {
            return {
              id: provider.id,

              name: provider.name,

              enabled: true,

              healthy: false,

              error:
                explainError(
                  error
                ),

              latencyMs:
                Date.now() -
                startedAt,
            };
          }
        }
      )
    );
  },
};
