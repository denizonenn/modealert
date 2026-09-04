import {
  createWatchlistWithLimitCheck,
  deleteWatchlist,
  getWatchlistsByEvent,
  getWatchlistsByUser,
  updateWatchlistChannels,
} from "@/lib/repositories/watchlist.repository";
import { FREE_WATCHLIST_LIMIT } from "@/lib/constants/plan";

// Thrown instead of creating the row — API routes translate this into
// a 402, distinct from a generic 500. See docs/06_DECISIONS.md
// ADR-041.
export class WatchlistLimitError extends Error {
  constructor() {
    super(
      `Free plan is limited to ${FREE_WATCHLIST_LIMIT} tracked events.`
    );
    this.name = "WatchlistLimitError";
  }
}

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
    const result = await createWatchlistWithLimitCheck(
      userId,
      eventId,
      FREE_WATCHLIST_LIMIT
    );

    if (result.limitReached) {
      throw new WatchlistLimitError();
    }

    return result.watchlist;
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

  async updateChannels(
    userId: string,
    eventId: string,
    channels: { emailEnabled?: boolean; discordEnabled?: boolean }
  ) {
    return updateWatchlistChannels(userId, eventId, channels);
  },
};