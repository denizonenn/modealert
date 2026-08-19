import {
  countWatchlistsByUser,
  createWatchlist,
  deleteWatchlist,
  getWatchlistsByEvent,
  getWatchlistsByUser,
} from "@/lib/repositories/watchlist.repository";
import { getUserPlan } from "@/lib/repositories/user.repository";
import { FREE_WATCHLIST_LIMIT, PLANS } from "@/lib/constants/plan";

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

  // Check-then-insert, not one atomic operation — safe for the
  // current one-at-a-time call sites (dashboard star toggle,
  // onboarding's sequential finish loop), but calling this
  // concurrently for the same user (e.g. via Promise.all) can race:
  // multiple calls can read the same pre-insert count and all pass
  // the limit check. See components/onboarding/finish-step.tsx for
  // the real incident this caused.
  async create(
    userId: string,
    eventId: string
  ) {
    const [plan, count] = await Promise.all([
      getUserPlan(userId),
      countWatchlistsByUser(userId),
    ]);

    if (
      plan === PLANS.FREE &&
      count >= FREE_WATCHLIST_LIMIT
    ) {
      throw new WatchlistLimitError();
    }

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