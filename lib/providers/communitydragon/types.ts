import type {
  ProviderEventStatus,
} from "@/lib/providers/core/provider";

export type CommunityDragonPatchline =
  | "live"
  | "pbe";

export interface CommunityDragonEventHubEvent {
  eventId: string;

  eventHubType: string;

  localizedName: string;

  localizedShortName?: string;

  startDate: string;

  progressEndDate?: string;

  endDate: string;

  navbarIconImage?: string;
}

export interface CommunityDragonEventHubEntry {
  event: CommunityDragonEventHubEvent;
}

export type CommunityDragonEventHubResponse =
  CommunityDragonEventHubEntry[];

export interface CommunityDragonDisplayEvent {
  id: string;

  title: string;

  status: ProviderEventStatus;

  startDate: string;

  endDate: string;

  hubType: string;
}

export interface CommunityDragonCurrentStatus {
  liveEvents: CommunityDragonDisplayEvent[];

  upcomingEvents: CommunityDragonDisplayEvent[];

  pbeCandidates: CommunityDragonDisplayEvent[];

  pbeCheckFailed: boolean;

  checkedAt: string;
}
