import type {
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

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

      description:
        providerStatus === "TRACKING"
          ? `Riot has an active maintenance window on the ${status.id} server.`
          : `${status.id} server is operating normally, no maintenance scheduled.`,

      status: providerStatus,

      category: EVENT_CATEGORIES.PLATFORM_STATUS,

      isLimitedTime: false,

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}