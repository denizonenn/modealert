import {
  createWatchlistWithLimitCheck,
  deleteWatchlist,
  getWatchlistsByEvent,
  getWatchlistsByUser,
  updateWatchlistChannels,
} from "@/lib/repositories/watchlist.repository";
import { env } from "@/lib/config/env";
import { FREE_WATCHLIST_LIMIT, UNLIMITED_WATCHLIST } from "@/lib/constants/plan";

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
    // ADR-067: while MONETIZATION_ENABLED is off, nobody is capped —
    // the DB-level plan check inside createWatchlistWithLimitCheck
    // still runs, it just never trips against an infinite limit.
    const result = await createWatchlistWithLimitCheck(
      userId,
      eventId,
      env.MONETIZATION_ENABLED
        ? FREE_WATCHLIST_LIMIT
        : UNLIMITED_WATCHLIST
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