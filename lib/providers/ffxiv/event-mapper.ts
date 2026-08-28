import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";

import type { FfxivGateStatus } from "./types";

// Same class of signal as Riot/Valorant's platform status: a single
// open/closed flag, not a real limited-time event. status 1 = open.
export function mapGateStatus(
  gate: FfxivGateStatus
): ProviderEvent[] {
  const isOpen = gate.status === 1;
  const status: ProviderEventStatus = isOpen ? "LIVE" : "TRACKING";

  const descriptionKey = isOpen
    ? "ffxiv.platformOperational"
    : "ffxiv.platformMaintenance";

  return [
    {
      id: "ffxiv-platform-status",

      gameId: GAME_IDS.FFXIV,

      title: "Platform Status",

      description: renderEventDescription(descriptionKey, {}, "en")!,
      descriptionKey,
      descriptionParams: {},

      status,

      category: EVENT_CATEGORIES.PLATFORM_STATUS,

      isLimitedTime: false,

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}
