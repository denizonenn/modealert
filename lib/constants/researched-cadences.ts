// A real, WebSearch-verified fallback for "when does this end / come
// back" — used ONLY when our own EventHistory doesn't have enough
// completed occurrences yet to compute a real average (tracking only
// started 2026-08-04, so almost nothing has 2+ completed cycles in
// our own data yet). Never overrides real tracked data once we have
// it — see event-prediction.service.ts.
//
// This is deliberately a short, hand-curated list, not an attempt to
// research every tracked event. Most rotating/limited-time events
// (Helldivers Major Orders, Foxhole wars, PlanetSide Alerts) are
// triggered by real-world conditions (population, narrative), not a
// fixed cadence — forcing a formula onto them would be a guess
// dressed up as data, which this project doesn't do. League of
// Legends' URF specifically was researched and rejected for the same
// reason: Riot's own 2025 changes moved it from a single annual slot
// to being distributed across seasonal Acts with no fixed interval —
// see docs/06_DECISIONS.md ADR-049. Arena already has a better
// signal than any formula could give (ADR-037's real live client
// config check), so it doesn't need one either.
export interface ResearchedCadence {
  // A real, sourced past occurrence's start date — not our own
  // "first time we happened to check" date, the actual verified date.
  anchorDate: Date;

  // The real, sourced typical cycle length.
  intervalDays: number;

  // Human-readable citation — what was found, and where.
  source: string;

  // When this was researched, so staleness is visible.
  verifiedAt: string;

  // Known reasons the cadence might not hold — real disruptions found
  // during research, not hedging for its own sake.
  caveats?: string;
}

export const RESEARCHED_CADENCES: Record<string, ResearchedCadence> = {
  "poe-current-league": {
    anchorDate: new Date("2026-07-24T20:00:00.000Z"),
    intervalDays: 98,
    source:
      "GGG's own challenge league cadence — 41 leagues since 2013, median cycle 98 days (~13 weeks), 87.8% launched on a Friday. Curse of the Allflame (the current league) launched July 24, 2026 at 13:00 PDT.",
    verifiedAt: "2026-08-13",
    caveats:
      "This cadence has been disrupted before — the league following Settlers of Kalguur (2024) took 322 days while GGG's resources shifted to Path of Exile 2. Treat as a rough estimate, not a guarantee.",
  },
};
