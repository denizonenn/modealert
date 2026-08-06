export const POE_API = {
  BASE_URL: "https://api.pathofexile.com",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// No key required. GGG's docs ask for a descriptive User-Agent as a
// courtesy (not enforced, but avoids being mistaken for abuse) — see
// client.ts. "main" leagues cover Standard/Hardcore/SSF/Ruthless
// permanent leagues plus the current temporary challenge league and
// its hardcore/SSF/ruthless variants — shared across the pc/xbox/sony
// realms (same league, same dates, launched simultaneously).
export const POE_LEAGUES_ENDPOINT = "/leagues?type=main";
