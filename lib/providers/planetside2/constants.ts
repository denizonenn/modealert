// `s:example` is Daybreak Census API's shared, zero-registration
// service id — same "keyless in spirit" trust class as Foxhole's
// developer API. Public, rate-limited, no account needed.
export const PLANETSIDE2_API = {
  BASE_URL: "https://census.daybreakgames.com/s:example/get/ps2:v2",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// PS2 consolidated to a single merged world after years of population
// decline — verified live 2026-08-13 (`/world` returns exactly one
// entry: world_id 1, "Osprey"). If Daybreak ever splits/renames
// worlds again, the events query below returns nothing for this id
// and the health check surfaces it, rather than silently tracking a
// dead server.
export const PLANETSIDE2_WORLD_ID = "1";

// Previously the backlog assumed live "Alert" (metagame event) status
// needed the realtime ESS websocket or diffing world_event history —
// re-examined 2026-08-13 and that was wrong. `world_event?type=
// METAGAME`, sorted by timestamp descending with a small limit, IS a
// real-time-enough REST poll: each Alert start/end transition is its
// own timestamped record, so the single most recent record already
// tells you whether one is live right now. No websocket needed.
export const PLANETSIDE2_ALERTS_ENDPOINT = `/world_event?type=METAGAME&world_id=${PLANETSIDE2_WORLD_ID}&c:limit=5&c:sort=timestamp:-1`;

export const PLANETSIDE2_METAGAME_EVENTS_ENDPOINT =
  "/metagame_event?c:limit=200";

export const PLANETSIDE2_ZONES_ENDPOINT = "/zone?c:limit=20";
