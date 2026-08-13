export const CLIENT_CONFIG_API = {
  BASE_URL: "https://clientconfig.rpg.riotgames.com",

  ENDPOINT: "/api/v1/config/public",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// Riot's own League Client hits this before login to configure the
// Play menu (region availability, feature flags) — no API key, no
// auth. Discovered 2026-08-13 while investigating why third-party
// site isurfback.com had real, differentiated per-region rotating-
// mode data ModeAlert didn't: it turned out to be querying this same
// service. IMPORTANT (found by cross-checking against isurfback's
// data, which caught a real bug before ship): a single response DOES
// bundle every region's dotted keys, but only the region matching the
// request's own `region` query param is actually accurate — every
// other region's entry in that same response is stale/wrong (verified
// directly: querying with region=NA1 falsely showed URF "enabled" in
// 14 regions where independent data said it wasn't; re-querying each
// region with its own `region` param fixed it). So this fetches once
// per region, not once total — see client.ts. PBE deliberately
// excluded from the "is this live" check — ModeAlert already keeps
// live/PBE separate everywhere else (see communitydragon-pbe
// provider), and blending a PBE-only queue into a "live" claim would
// misrepresent it.
export const CLIENT_CONFIG_REGIONS = [
  "na1",
  "euw1",
  "eun1",
  "kr",
  "jp1",
  "tr1",
  "br1",
  "la1",
  "la2",
  "oc1",
  "ru",
  "me1",
  "sg2",
  "tw2",
  "vn2",
] as const;
