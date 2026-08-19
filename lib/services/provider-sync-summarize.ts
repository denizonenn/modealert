export type ProviderSyncOutcome =
  | { provider: string; skipped: true }
  | { provider: string; received: number; saved: number }
  | { provider: string; error: string };

export function summarizeSyncResults(
  providerNames: string[],
  results: PromiseSettledResult<ProviderSyncOutcome>[]
): ProviderSyncOutcome[] {
  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    return {
      provider: providerNames[index],
      error:
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown error",
    };
  });
}
