import type {
  ProviderEvent,
} from "../core/provider";

import type {
  RiotChampionRotationResponse,
} from "./types";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";

export function mapChampionRotation(
  rotation: RiotChampionRotationResponse
): ProviderEvent[] {
  const descriptionParams = {
    freeCount: rotation.sr.length,
    newPlayerCount: rotation.newplayer.length,
  };

  return [
    {
      id: "riot-champion-rotation",

      gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

      title: `Champion Rotation (${rotation.sr.length} Champions)`,

      description: renderEventDescription(
        "riot.championRotation",
        descriptionParams,
        "en"
      )!,
      descriptionKey: "riot.championRotation",
      descriptionParams,

      status: "LIVE",

      category: EVENT_CATEGORIES.ROTATION_MILESTONE,

      isLimitedTime: false,

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}