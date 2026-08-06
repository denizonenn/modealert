export interface BungieResponse<T> {
  Response: T;
  ErrorCode: number;
  ErrorStatus: string;
  Message: string;
}

export interface DestinyPublicMilestone {
  milestoneHash: number;
  startDate?: string;
  endDate?: string;
}

export type DestinyPublicMilestonesResponse = Record<
  string,
  DestinyPublicMilestone
>;

export interface DestinySystemStatus {
  enabled: boolean;
}

export interface DestinySettingsResponse {
  systems: Record<string, DestinySystemStatus>;
}

export interface DestinyManifestResponse {
  jsonWorldComponentContentPaths: {
    en: Record<string, string>;
  };
}

export interface DestinyMilestoneDefinition {
  displayProperties?: {
    name?: string;
    description?: string;
  };
}

export type DestinyMilestoneDefinitionTable = Record<
  string,
  DestinyMilestoneDefinition
>;
