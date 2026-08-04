import type {
  ProviderEvent,
} from "../core/provider";

import type {
  RiotChampionRotationResponse,
} from "./types";

import { GAME_IDS } from "@/lib/constants/games";

export function mapChampionRotation(
  rotation: RiotChampionRotationResponse
): ProviderEvent[] {
  return [
    {
      id: "riot-champion-rotation",

      gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

      title: `Champion Rotation (${rotation.sr.length} Champions)`,

      status: "LIVE",

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}