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

  const description: Record<ProviderEventStatus, string> = {
    UPCOMING: `War #${war.warNumber} is scheduled to begin soon.`,
    LIVE: `Ongoing Colonial vs. Warden conquest — ${war.requiredVictoryTowns} town captures needed for victory.`,
    TRACKING: `War #${war.warNumber} has entered the resistance phase — the losing side gets one last chance to fight back.`,
    ENDED: `War #${war.warNumber} has ended${war.winner !== "NONE" ? ` — ${war.winner} won` : ""}.`,
  };

  return [
    {
      id: "foxhole-current-war",
      gameId: GAME_IDS.FOXHOLE,
      title: `War #${war.warNumber}`,
      description: description[status],
      status,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}
