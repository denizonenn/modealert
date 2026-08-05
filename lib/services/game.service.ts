import {
  getGames,
  getGameById,
  getGameBySlug,
  getFeaturedGames,
} from "@/lib/repositories/game.repository";

import { getTrackedUserCountsByGame } from "@/lib/repositories/watchlist.repository";
import { getEventCountsByGame } from "@/lib/repositories/event.repository";

import { formatCount } from "@/lib/utils";

export const gameService = {
  async getAllGames() {
    const [games, trackedCounts, eventCounts] = await Promise.all([
      getGames(),
      getTrackedUserCountsByGame(),
      getEventCountsByGame(),
    ]);

    return games.map((game) => ({
      ...game,
      activeUsers: formatCount(trackedCounts[game.id] ?? 0),
      supportedEvents: eventCounts[game.id] ?? 0,
    }));
  },

  async getById(id: string) {
    return getGameById(id);
  },

  async getBySlug(slug: string) {
    return getGameBySlug(slug);
  },

  async getFeaturedGames() {
    return getFeaturedGames();
  },
};
