export const PUBG_API = {
  BASE_URL: "https://api.pubg.com",

  // PUBG's API is shard-scoped by platform. Steam (PC) is the
  // dominant platform and the season data is representative of the
  // game's live ranked season regardless of platform — same
  // single-primary-platform scoping this app already uses elsewhere
  // (e.g. Riot's default region).
  SHARD: "steam",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

export const PUBG_SEASONS_ENDPOINT = `/shards/${PUBG_API.SHARD}/seasons`;
