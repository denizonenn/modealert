export const HELLDIVERS2_API = {
  BASE_URL: "https://api.helldivers2.dev",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// Community-run mirror of Arrowhead's game backend, no key required.
// `X-Super-Client`/`X-Super-Contact` are the project's requested
// courtesy headers (X-Super-Client is documented as becoming
// mandatory) — see client.ts.
export const HELLDIVERS2_ASSIGNMENTS_ENDPOINT = "/api/v1/assignments";
