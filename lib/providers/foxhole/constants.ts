export const FOXHOLE_API = {
  BASE_URL: "https://war-service-live.foxholeservices.com",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// Official API published by Clapfoot (the developer), no key required.
export const FOXHOLE_WAR_ENDPOINT = "/api/worldconquest/war";
