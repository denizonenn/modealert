import type {
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";

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

      gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

      title: "Platform Status",

      status: providerStatus,

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}