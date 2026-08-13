export const TFT_API = {
  BASE_URL: "https://tr1.api.riotgames.com",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

export const TFT_PLATFORM_STATUS_ENDPOINT =
  "/tft/status/v1/platform-data";

// CommunityDragon's `/latest/` branch mirrors the live game files
// directly (same trust class already used by the LoL event-hub/
// queues.json providers) — verified 2026-08-13 to be more current
// than Data Dragon's versioned tft-champion.json, which still showed
// Set 17 as the highest set present while this endpoint already had
// Set 18 (WebSearch-confirmed launch date: 2026-08-12). No smaller
// CDragon endpoint exists for just the set list — every locale file
// is ~26MB, so this is a real cost per sync, accepted because it's
// the only source that isn't stale.
export const TFT_CDRAGON_SETS_URL =
  "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json";
