import {
  getGames,
  getGameById,
  getGameBySlug,
  getFeaturedGames,
} from "@/lib/repositories/game.repository";

import { getTrackedUserCountsByGame } from "@/lib/repositories/watchlist.repository";

import { formatCount } from "@/lib/utils";

export const gameService = {
  async getAllGames() {
    const [games, trackedCounts] = await Promise.all([
      getGames(),
      getTrackedUserCountsByGame(),
    ]);

    return games.map((game) => ({
      ...game,
      activeUsers: formatCount(trackedCounts[game.id] ?? 0),
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
