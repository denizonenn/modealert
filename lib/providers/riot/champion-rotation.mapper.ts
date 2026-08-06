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

      description: `${rotation.sr.length} champions are free to play this week, plus ${rotation.newplayer.length} additional champions for accounts under level 11.`,

      status: "LIVE",

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}