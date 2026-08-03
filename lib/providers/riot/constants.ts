export const RIOT_API = {
  BASE_URL: "https://tr1.api.riotgames.com",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

/*
|--------------------------------------------------------------------------
| Riot endpoints
|--------------------------------------------------------------------------
*/

export const RIOT_PLATFORM_STATUS_ENDPOINT =
  "/lol/status/v4/platform-data";

export const RIOT_CHAMPION_ROTATION_ENDPOINT =
  "/lol/platform/v3/champion-rotations";

/*
|--------------------------------------------------------------------------
| Mode Notify endpoints
|--------------------------------------------------------------------------
|
| Bunlar bizim normalize edilmiş endpointlerimiz olacak.
| Provider yalnızca bunları kullanacak.
|
*/

export const RIOT_EVENTS_ENDPOINT =
  "/events";