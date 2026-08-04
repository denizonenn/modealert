export const VALORANT_API = {
  BASE_URL: "https://eu.api.riotgames.com",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

export const VALORANT_STATUS_ENDPOINT =
  "/val/status/v1/platform-data";

export const VALORANT_CONTENT_ENDPOINT =
  "/val/content/v1/contents";
