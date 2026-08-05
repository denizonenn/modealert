import type { ProviderEvent, ProviderEventStatus } from "../core/provider";
import { GAME_IDS } from "@/lib/constants/games";
import type { TftPlatformStatusResponse } from "./types";

export function mapPlatformStatus(
  status: TftPlatformStatusResponse
): ProviderEvent[] {
  const providerStatus: ProviderEventStatus =
    status.maintenances && status.maintenances.length > 0
      ? "TRACKING"
      : "LIVE";

  return [
    {
      id: `tft-platform-${status.id}`,
      gameId: GAME_IDS.TFT,
      title: "Platform Status",
      status: providerStatus,
      trackedUsers: 0,
      checkedAt: new Date(),
    },
  ];
}
