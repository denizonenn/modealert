export const FFXIV_API = {
  BASE_URL: "https://frontier.ffxiv.com",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// Official Square Enix endpoint the FFXIV launcher itself queries
// before login, no key required. Only exposes one real signal:
// status 1 = login gate open, anything else = closed (maintenance).
export const FFXIV_GATE_STATUS_ENDPOINT = "/worldStatus/gate_status.json";
