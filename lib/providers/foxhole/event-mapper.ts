import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import {
  renderEventDescription,
  type EventDescriptionParams,
} from "@/lib/i18n/event-descriptions";

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

  const descriptionKeys: Record<ProviderEventStatus, string> = {
    UPCOMING: "foxhole.warUpcoming",
    LIVE: "foxhole.warLive",
    TRACKING: "foxhole.warTracking",
    ENDED: "foxhole.warEnded",
  };

  const descriptionParamsByStatus: Record<
    ProviderEventStatus,
    EventDescriptionParams
  > = {
    UPCOMING: { warNumber: war.warNumber },
    LIVE: { requiredVictoryTowns: war.requiredVictoryTowns },
    TRACKING: { warNumber: war.warNumber },
    ENDED: {
      warNumber: war.warNumber,
      winner: war.winner !== "NONE" ? war.winner : undefined,
    },
  };

  const descriptionKey = descriptionKeys[status];
  const descriptionParams = descriptionParamsByStatus[status];

  return [
    {
      id: "foxhole-current-war",
      gameId: GAME_IDS.FOXHOLE,
      title: `War #${war.warNumber}`,
      description: renderEventDescription(
        descriptionKey,
        descriptionParams,
        "en"
      )!,
      descriptionKey,
      descriptionParams,
      status,
      category: EVENT_CATEGORIES.PLAYABLE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}
