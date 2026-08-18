export const GAME_IDS = {
  LEAGUE_OF_LEGENDS: "lol",

  VALORANT: "valorant",

  DESTINY_2: "destiny",

  TFT: "tft",

  FORTNITE: "fortnite",

  WARFRAME: "warframe",

  PATH_OF_EXILE: "poe",

  HELLDIVERS_2: "helldivers2",

  FOXHOLE: "foxhole",

  PUBG: "pubg",

  PLANETSIDE_2: "planetside2",

  FFXIV: "ffxiv",

  EA_FC: "ea-fc",
} as const;

// Games seeded in the DB with a real, working provider syncing events.
// Anything else is a placeholder Game row with no live data behind it
// yet — see docs/06_DECISIONS.md ADR-006/ADR-011/ADR-013/ADR-014/
// ADR-015/ADR-016.
export const GAMES_WITH_PROVIDER: Set<string> = new Set(
  Object.values(GAME_IDS)
);
