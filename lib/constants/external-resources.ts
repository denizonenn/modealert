import { GAME_IDS } from "@/lib/constants/games";

// Third-party stats/build sites relevant per game — outbound links
// only, no scraping/embedding (u.gg has no public API). Only added
// where a real, verified page exists; not every game has one.
export const EXTERNAL_RESOURCES: Partial<
  Record<
    string,
    { label: string; url: string }[]
  >
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
};
