import type {
  ProviderEvent,
} from "../core/provider";

import type {
  RiotChampionRotationResponse,
} from "./types";

export function mapChampionRotation(
  rotation: RiotChampionRotationResponse
): ProviderEvent[] {
  return [
    {
      id: "riot-champion-rotation",

      gameId: "league-of-legends",

      title: `Champion Rotation (${rotation.freeChampionIds.length} Champions)`,

      status: "LIVE",

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}