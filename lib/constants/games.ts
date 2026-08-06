export const GAME_IDS = {
  LEAGUE_OF_LEGENDS: "lol",

  VALORANT: "valorant",

  DESTINY_2: "destiny",

  TFT: "tft",

  FORTNITE: "fortnite",

  WARFRAME: "warframe",

  PATH_OF_EXILE: "poe",
} as const;

// Games seeded in the DB with a real, working provider syncing events.
// Anything else is a placeholder Game row with no live data behind it
// yet — see docs/06_DECISIONS.md ADR-006/ADR-011/ADR-013/ADR-014.
export const GAMES_WITH_PROVIDER: Set<string> = new Set(
  Object.values(GAME_IDS)
);
