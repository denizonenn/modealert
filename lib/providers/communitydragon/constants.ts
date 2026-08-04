import type {
  CommunityDragonPatchline,
} from "./types";

export const COMMUNITY_DRAGON_BASE_URLS: Record<
  CommunityDragonPatchline,
  string
> = {
  live: "https://raw.communitydragon.org/latest",
  pbe: "https://raw.communitydragon.org/pbe",
};

export const COMMUNITY_DRAGON = {
  TIMEOUT: 10000,
} as const;

export const COMMUNITY_DRAGON_EVENT_HUB =
  "/plugins/rcp-be-lol-game-data/global/default/v1/event-hub.json";
