import { GAME_IDS } from "@/lib/constants/games";

export const STEAM_API = {
  BASE_URL: "https://store.steampowered.com",

  TIMEOUT: 10_000,

  RETRY_COUNT: 3,
} as const;

// Valve's own store-front API (store.steampowered.com/api/appdetails),
// no key required. Only paid games return a real price_overview —
// free-to-play games (Warframe, PoE, PlanetSide 2, PUBG since its
// 2022 F2P switch) come back with an empty data object, so this list
// is deliberately limited to the tracked games actually sold for
// money on Steam right now.
interface SteamTrackedGame {
  gameId: string;
  gameName: string;
  appId: number;
}

export const STEAM_TRACKED_GAMES: SteamTrackedGame[] = [
  { gameId: GAME_IDS.HELLDIVERS_2, gameName: "Helldivers 2", appId: 553850 },
  { gameId: GAME_IDS.FOXHOLE, gameName: "Foxhole", appId: 505460 },
];
