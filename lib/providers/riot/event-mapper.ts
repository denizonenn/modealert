import type {
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";

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

  const descriptionKey =
    providerStatus === "TRACKING"
      ? "riot.platformMaintenance"
      : "riot.platformOperational";
  const descriptionParams = { region: status.id, unit: "server" };

  return [
    {
      id: `riot-platform-${status.id}`,

      gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

      title: "Platform Status",

      description: renderEventDescription(
        descriptionKey,
        descriptionParams,
        "en"
      )!,
      descriptionKey,
      descriptionParams,

      status: providerStatus,

      category: EVENT_CATEGORIES.PLATFORM_STATUS,

      isLimitedTime: false,

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}