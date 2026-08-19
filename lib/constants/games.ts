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

// Display names, matching the real `Game.name` values in the DB
// (verified against production 2026-08-19). Needed where a game's
// name has to be resolved from just a gameId without a DB round trip
// — notably notification copy, which runs per-recipient inside the
// sync loop. Falls back to the raw id via `gameName()` so a new game
// added to GAME_IDS but missed here degrades to something readable
// rather than "undefined".
export const GAME_NAMES: Record<string, string> = {
  [GAME_IDS.LEAGUE_OF_LEGENDS]: "League of Legends",
  [GAME_IDS.VALORANT]: "Valorant",
  [GAME_IDS.DESTINY_2]: "Destiny 2",
  [GAME_IDS.TFT]: "Teamfight Tactics",
  [GAME_IDS.FORTNITE]: "Fortnite",
  [GAME_IDS.WARFRAME]: "Warframe",
  [GAME_IDS.PATH_OF_EXILE]: "Path of Exile",
  [GAME_IDS.HELLDIVERS_2]: "Helldivers 2",
  [GAME_IDS.FOXHOLE]: "Foxhole",
  [GAME_IDS.PUBG]: "PUBG: BATTLEGROUNDS",
  [GAME_IDS.PLANETSIDE_2]: "PlanetSide 2",
  [GAME_IDS.FFXIV]: "Final Fantasy XIV",
  [GAME_IDS.EA_FC]: "EA Sports FC (Ultimate Team)",
};

export function gameName(gameId: string): string {
  return GAME_NAMES[gameId] ?? gameId;
}
