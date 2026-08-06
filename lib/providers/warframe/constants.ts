export const WARFRAME_API = {
  BASE_URL: "https://api.warframestat.us",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// warframestat.us is community-run but sources directly from Digital
// Extremes' own worldstate feed — same data the in-game UI reads. "pc"
// is the platform with the earliest rotations (console/mobile lag a
// few hours behind on cross-save).
export const WARFRAME_WORLDSTATE_ENDPOINT = "/pc";
