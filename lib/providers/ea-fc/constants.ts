export const FUT_GG_API = {
  BASE_URL: "https://www.fut.gg",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// FUT.GG is one of only 3 sites authorized under EA's own "FC
// Community API" (see EA's FC26 Community API Update pitch notes) —
// not first-party EA data (that program is a closed allowlist
// ModeAlert isn't on), but a real, live, currently-verified-active
// signal from the site the FUT community actually uses daily. A
// deliberately looser trust tier than every other provider in this
// project — see docs/06_DECISIONS.md ADR-053.
//
// EA ships a new FC title yearly under a new numeric game id in
// FUT.GG's own API path. Bump this by hand each year — same
// once-a-year manual-maintenance class as TFT's set number used to
// be before it was made dynamic.
export const FUT_GG_GAME_YEAR = "26";

export function futGgSbcEndpoint(page: number): string {
  return `/api/fut/sbc/${FUT_GG_GAME_YEAR}/?page=${page}`;
}

// SBCs with an end date this far out are permanent tutorial/grind
// content ("Intro to SBCs", "Gold Upgrade"), not real time-boxed
// events — same sentinel-date pattern as ADR-020's LoL fix.
export const FUT_GG_SENTINEL_YEAR_CUTOFF = 2030;
