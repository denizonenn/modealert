export const TFT_API = {
  BASE_URL: "https://tr1.api.riotgames.com",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

export const TFT_PLATFORM_STATUS_ENDPOINT =
  "/tft/status/v1/platform-data";
