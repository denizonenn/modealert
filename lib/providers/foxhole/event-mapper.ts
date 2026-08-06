import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";

import type { FoxholeWarState } from "./types";

export function mapCurrentWar(war: FoxholeWarState): ProviderEvent[] {
  const now = new Date();

  const conquestStart = new Date(war.conquestStartTime);

  let status: ProviderEventStatus = "LIVE";

  if (now < conquestStart) {
    status = "UPCOMING";
  } else if (war.winner !== "NONE" || war.conquestEndTime !== null) {
    status = "ENDED";
  } else if (war.resistanceStartTime !== null) {
    status = "TRACKING";
  }

  return [
    {
      id: "foxhole-current-war",
      gameId: GAME_IDS.FOXHOLE,
      title: `War #${war.warNumber}`,
      status,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}
