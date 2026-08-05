import type { ProviderEvent, ProviderEventStatus } from "../core/provider";
import { GAME_IDS } from "@/lib/constants/games";
import type {
  DestinyMilestoneDefinitionTable,
  DestinyPublicMilestonesResponse,
  DestinySettingsResponse,
} from "./types";

export function mapPlatformStatus(
  settings: DestinySettingsResponse
): ProviderEvent[] {
  const enabled = settings.systems.Destiny2?.enabled ?? true;

  const status: ProviderEventStatus = enabled ? "LIVE" : "TRACKING";

  return [
    {
      id: "destiny-platform-status",
      gameId: GAME_IDS.DESTINY_2,
      title: "Platform Status",
      status,
      trackedUsers: 0,
      checkedAt: new Date(),
    },
  ];
}

export function mapActiveMilestones(
  milestones: DestinyPublicMilestonesResponse,
  definitions: DestinyMilestoneDefinitionTable
): ProviderEvent[] {
  const now = new Date();

  return Object.values(milestones)
    .map((milestone): ProviderEvent | null => {
      const name =
        definitions[String(milestone.milestoneHash)]?.displayProperties
          ?.name;

      if (!name) {
        return null;
      }

      return {
        id: `destiny-milestone-${milestone.milestoneHash}`,
        gameId: GAME_IDS.DESTINY_2,
        title: name,
        status: "LIVE",
        trackedUsers: 0,
        checkedAt: now,
      };
    })
    .filter((event): event is ProviderEvent => event !== null);
}

export function mapDestinyEvents(
  settings: DestinySettingsResponse,
  milestones: DestinyPublicMilestonesResponse,
  definitions: DestinyMilestoneDefinitionTable
): ProviderEvent[] {
  return [
    ...mapPlatformStatus(settings),
    ...mapActiveMilestones(milestones, definitions),
  ];
}
