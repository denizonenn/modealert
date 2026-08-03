import {
  createWatchlist,
  deleteWatchlist,
  getWatchlistsByEvent,
  getWatchlistsByUser,
} from "@/lib/repositories/watchlist.repository";

export const watchlistService = {
  async getByUser(userId: string) {
    return getWatchlistsByUser(userId);
  },

  async getByEvent(eventId: string) {
    return getWatchlistsByEvent(eventId);
  },

  async create(
    userId: string,
    eventId: string
  ) {
    return createWatchlist(
      userId,
      eventId
    );
  },

  async delete(
    userId: string,
    eventId: string
  ) {
    return deleteWatchlist(
      userId,
      eventId
    );
  },
};