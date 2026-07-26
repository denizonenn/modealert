import {
  getWatchlistsByUser,
} from "@/lib/repositories/watchlist.repository";

export const watchlistService = {
  async getByUser(userId: string) {
    return getWatchlistsByUser(userId);
  },
};