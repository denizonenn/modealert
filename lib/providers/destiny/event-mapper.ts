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
      description: enabled
        ? "Destiny 2 servers are operating normally, no maintenance scheduled."
        : "Destiny 2 has an active maintenance window — the game may be unreachable.",
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
      const displayProperties =
        definitions[String(milestone.milestoneHash)]?.displayProperties;

      const name = displayProperties?.name;

      if (!name) {
        return null;
      }

      return {
        id: `destiny-milestone-${milestone.milestoneHash}`,
        gameId: GAME_IDS.DESTINY_2,
        title: name,
        description: displayProperties?.description || undefined,
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
