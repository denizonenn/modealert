import {
  getGames,
  getGameById,
  getFeaturedGames,
} from "@/lib/repositories/game.repository";

export const gameService = {
  async getAllGames() {
    return getGames();
  },

  async getById(id: string) {
    return getGameById(id);
  },

  async getFeaturedGames() {
    return getFeaturedGames();
  },
};