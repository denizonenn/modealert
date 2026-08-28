import type { ProviderEvent, ProviderEventStatus } from "../core/provider";
import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";
import type { TftPlatformStatusResponse, TftSetsResponse } from "./types";

export function mapPlatformStatus(
  status: TftPlatformStatusResponse
): ProviderEvent[] {
  const providerStatus: ProviderEventStatus =
    status.maintenances && status.maintenances.length > 0
      ? "TRACKING"
      : "LIVE";

  const descriptionKey =
    providerStatus === "TRACKING"
      ? "riot.platformMaintenance"
      : "riot.platformOperational";
  const descriptionParams = { region: status.id, unit: "server" };

  return [
    {
      id: `tft-platform-${status.id}`,
      gameId: GAME_IDS.TFT,
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

// The current live TFT set — derived from the highest set number
// present in CommunityDragon's live game-file mirror (see constants.ts
// for why that source over Data Dragon). `id` is set-number-scoped so
// launching a new set naturally ends the previous one and starts a
// fresh occurrence (source-scoped expiry + EventHistory pick this up
// automatically, same as every other rotating id in this app) —
// that's also what makes "a new set just launched" a real notifiable
// change instead of a silently-updated description.
export function mapCurrentSet(
  response: TftSetsResponse
): ProviderEvent[] {
  const setNumbers = Object.keys(response.sets)
    .map(Number)
    .filter((n) => Number.isFinite(n));

  if (setNumbers.length === 0) {
    return [];
  }

  const currentSet = Math.max(...setNumbers);

  return [
    {
      id: `tft-set-${currentSet}`,
      gameId: GAME_IDS.TFT,
      title: `Set ${currentSet}`,
      description: renderEventDescription("tft.setDescription", {}, "en")!,
      descriptionKey: "tft.setDescription",
      descriptionParams: {},
      status: "LIVE",
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      seriesKey: "tft-set",
      trackedUsers: 0,
      checkedAt: new Date(),
    },
  ];
}
