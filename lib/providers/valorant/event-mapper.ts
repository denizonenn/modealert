import type {
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";

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

      status: providerStatus,

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

  return content.acts
    .filter((act) => act.isActive)
    .map((act) => ({
      id: `valorant-act-${act.id}`,

      gameId: GAME_IDS.VALORANT,

      title: actTitle(act),

      status: "LIVE" as const,

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
