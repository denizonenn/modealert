import type {
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

import type {
  ValorantAct,
  ValorantContentResponse,
  ValorantPlatformStatusResponse,
} from "./types";

interface ValorantPlatformStatus {
  id: string;

  maintenances?: unknown[];
}

export function mapPlatformStatus(
  status: ValorantPlatformStatus
): ProviderEvent[] {
  const providerStatus: ProviderEventStatus =
    status.maintenances &&
    status.maintenances.length > 0
      ? "TRACKING"
      : "LIVE";

  return [
    {
      id: `valorant-platform-${status.id}`,

      gameId: GAME_IDS.VALORANT,

      title: "Platform Status",

      description:
        providerStatus === "TRACKING"
          ? `Riot has an active maintenance window on the ${status.id} shard.`
          : `${status.id} shard is operating normally, no maintenance scheduled.`,

      status: providerStatus,

      category: EVENT_CATEGORIES.PLATFORM_STATUS,

      isLimitedTime: false,

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}

function actTitle(
  act: ValorantAct
): string {
  return (
    act.localizedNames?.["en-US"] ??
    act.name
  );
}

export function mapActiveActs(
  content: ValorantContentResponse
): ProviderEvent[] {
  const now = new Date();

  // Riot's content-service `acts` array mixes two real, different
  // things with the same `isActive` flag: the ~2-month Act itself
  // (`type: "act"`) and its parent Episode container (`type:
  // "episode"`, spans several Acts, stays active for much longer).
  // Both flagged active at once — confirmed live 2026-08-19 ("V26"
  // episode + "ACT V" act, both isActive: true — mapping both
  // produced two events simultaneously claiming to be "the current
  // competitive act", a real contradiction. Only the Act is what
  // that description actually describes.
  return content.acts
    .filter((act) => act.isActive && act.type === "act")
    .map((act) => ({
      id: `valorant-act-${act.id}`,

      gameId: GAME_IDS.VALORANT,

      title: actTitle(act),

      description: `${actTitle(act)} is Valorant's current ~2-month competitive season phase — new act rank rewards and battle pass content are live.`,

      status: "LIVE" as const,

      category: EVENT_CATEGORIES.SEASON_PASS,

      isLimitedTime: true,

      trackedUsers: 0,

      checkedAt: now,
    }));
}

export function mapValorantEvents(
  status: ValorantPlatformStatusResponse,
  content: ValorantContentResponse
): ProviderEvent[] {
  return [
    ...mapPlatformStatus(status),
    ...mapActiveActs(content),
  ];
}
