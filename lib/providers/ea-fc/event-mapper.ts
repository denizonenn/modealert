import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";

import { FUT_GG_SENTINEL_YEAR_CUTOFF } from "./constants";

import type { FutGgSbc } from "./types";

// FUT.GG lists 50+ SBCs at any time — most are permanent tutorials
// (sentinel end dates years out) or endlessly-repeatable daily grind
// upgrades, same too-granular/low-signal problem as Warframe's
// excluded alerts/invasions. Aggregated into one live count instead,
// same pattern as Fortnite's "Item Shop (N items)".
export function mapSbcActivity(sbcs: FutGgSbc[]): ProviderEvent[] {
  const now = new Date();

  const realTimeBoxed = sbcs.filter((sbc) => {
    const end = new Date(sbc.endTime);
    return (
      end.getFullYear() < FUT_GG_SENTINEL_YEAR_CUTOFF && end > now
    );
  });

  const status: ProviderEventStatus =
    realTimeBoxed.length > 0 ? "LIVE" : "TRACKING";

  const nearestEnd =
    realTimeBoxed.length > 0
      ? realTimeBoxed.reduce((soonest, sbc) =>
          new Date(sbc.endTime) < new Date(soonest.endTime)
            ? sbc
            : soonest
        ).endTime
      : null;

  const descriptionKey = nearestEnd ? "eaFc.sbcActive" : "eaFc.sbcInactive";
  const descriptionParams = nearestEnd
    ? {
        count: realTimeBoxed.length,
        nearestEndDate: new Date(nearestEnd).toISOString().slice(0, 10),
      }
    : {};

  return [
    {
      id: "ea-fc-sbc-activity",

      gameId: GAME_IDS.EA_FC,

      title: `Squad Building Challenges (${realTimeBoxed.length} active)`,

      description: renderEventDescription(
        descriptionKey,
        descriptionParams,
        "en"
      )!,
      descriptionKey,
      descriptionParams,

      status,

      category: EVENT_CATEGORIES.ROTATION_MILESTONE,

      isLimitedTime: true,

      trackedUsers: 0,

      checkedAt: now,
    },
  ];
}
