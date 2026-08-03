import type {
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

interface RiotPlatformStatus {
  id: string;

  maintenances?: unknown[];
}

export function mapPlatformStatus(
  status: RiotPlatformStatus
): ProviderEvent[] {
  const providerStatus: ProviderEventStatus =
    status.maintenances &&
    status.maintenances.length > 0
      ? "TRACKING"
      : "LIVE";

  return [
    {
      id: `riot-platform-${status.id}`,

      gameId: "league-of-legends",

      title: "Platform Status",

      status: providerStatus,

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}