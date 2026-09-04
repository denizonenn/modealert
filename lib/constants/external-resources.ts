import { GAME_IDS } from "@/lib/constants/games";

export interface ExternalResource {
  label: string;
  url: string;
}

// Third-party stats/build sites relevant per game — outbound links
// only, no scraping/embedding (most of these have no public API).
// Only added where a real, verified page exists; not every game has
// one. Free for every plan (not part of the Premium prediction/
// statistics tier) — see docs/09_BACKLOG.md.
export const EXTERNAL_RESOURCES: Partial<
  Record<string, ExternalResource[]>
> = {
  [GAME_IDS.LEAGUE_OF_LEGENDS]: [
    {
      label: "u.gg — Tier List & Builds",
      url: "https://u.gg/lol/tier-list",
    },
  ],

  [GAME_IDS.TFT]: [
    {
      label: "u.gg — TFT Comps & Tier List",
      url: "https://u.gg/tft",
    },
  ],

  [GAME_IDS.VALORANT]: [
    {
      label: "u.gg — Valorant Agent Tier List",
      url: "https://u.gg/val/tierlist/agents",
    },
  ],

  [GAME_IDS.DESTINY_2]: [
    {
      label: "light.gg — Destiny 2 Loadouts",
      url: "https://www.light.gg/loadouts/",
    },
  ],

  [GAME_IDS.WARFRAME]: [
    {
      label: "Overframe — Warframe Builds",
      url: "https://overframe.gg/builds/warframes/",
    },
  ],

  [GAME_IDS.PATH_OF_EXILE]: [
    {
      label: "poe.ninja — Build & Economy Stats",
      url: "https://poe.ninja/stats",
    },
  ],

  [GAME_IDS.PUBG]: [
    {
      label: "op.gg — PUBG Stats",
      url: "https://op.gg/pubg",
    },
  ],

  [GAME_IDS.FORTNITE]: [
    {
      label: "Fortnite.GG — Item Shop",
      url: "https://fortnite.gg/shop",
    },
  ],

  [GAME_IDS.EA_FC]: [
    {
      label: "FUT.GG — Squad Builder",
      url: "https://www.fut.gg/squad-builder/",
    },
  ],
};

// Event-title overrides for specific League rotating modes — someone
// opening the URF event page wants a URF tier list, not the generic
// all-roles LoL one EXTERNAL_RESOURCES has. Checked before falling
// back to the per-game list.
const LOL_TITLE_OVERRIDES: { match: RegExp; resource: ExternalResource }[] = [
  {
    match: /arena/i,
    resource: {
      label: "u.gg — Arena Tier List",
      url: "https://u.gg/lol/arena-tier-list",
    },
  },
  {
    match: /urf/i,
    resource: {
      label: "u.gg — URF Tier List",
      url: "https://u.gg/lol/urf-tier-list",
    },
  },
];

// Per-event lookup, used by /events/[slug] — same directory as
// EXTERNAL_RESOURCES (which /games/[slug] uses as-is), but swaps in a
// mode-specific override when the event's title matches a known LoL
// rotating mode.
export function externalResourcesForEvent(
  gameId: string,
  eventTitle: string
): ExternalResource[] | undefined {
  if (gameId === GAME_IDS.LEAGUE_OF_LEGENDS) {
    const override = LOL_TITLE_OVERRIDES.find((entry) =>
      entry.match.test(eventTitle)
    );

    if (override) {
      return [override.resource];
    }
  }

  return EXTERNAL_RESOURCES[gameId];
}
