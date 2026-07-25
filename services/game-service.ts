import { games } from "@/lib/data/games";
import { Game } from "@/types/game";

export const gameService = {
  async getGames(): Promise<Game[]> {
    return Promise.resolve(games);
  },

  async getGame(id: string): Promise<Game | undefined> {
    return Promise.resolve(
      games.find((game) => game.id === id)
    );
  },

  async getPopularGames(): Promise<Game[]> {
    return Promise.resolve(
      games.filter((game) => game.featured)
    );
  },
};