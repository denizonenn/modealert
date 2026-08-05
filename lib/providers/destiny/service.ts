import { destinyClient } from "./client";
import {
  DESTINY_MANIFEST_ENDPOINT,
  DESTINY_MILESTONES_ENDPOINT,
  DESTINY_SETTINGS_ENDPOINT,
} from "./constants";
import { mapDestinyEvents } from "./event-mapper";
import type {
  DestinyManifestResponse,
  DestinyMilestoneDefinitionTable,
  DestinyPublicMilestonesResponse,
  DestinySettingsResponse,
} from "./types";

async function getMilestoneDefinitions(): Promise<DestinyMilestoneDefinitionTable> {
  const manifest = await destinyClient.get<DestinyManifestResponse>(
    DESTINY_MANIFEST_ENDPOINT
  );

  const path =
    manifest.jsonWorldComponentContentPaths.en.DestinyMilestoneDefinition;

  return destinyClient.getStatic<DestinyMilestoneDefinitionTable>(path);
}

export const destinyService = {
  async getEvents() {
    const [settings, milestones, definitions] = await Promise.all([
      destinyClient.get<DestinySettingsResponse>(DESTINY_SETTINGS_ENDPOINT),
      destinyClient.get<DestinyPublicMilestonesResponse>(
        DESTINY_MILESTONES_ENDPOINT
      ),
      getMilestoneDefinitions(),
    ]);

    return mapDestinyEvents(settings, milestones, definitions);
  },
};
