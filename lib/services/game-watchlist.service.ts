import {
  createGameWatchlist,
  deleteGameWatchlist,
  getGameWatchlistsByUser,
} from "@/lib/repositories/game-watchlist.repository";
import { getUserPlan } from "@/lib/repositories/user.repository";
import { PLANS } from "@/lib/constants/plan";

// Thrown instead of creating the row — API routes translate this into
// a 402, same pattern as WatchlistLimitError. Following a whole game
// is Premium-only: it's unlimited coverage of every current and
// future event for that game, which would make the free per-event
// limit meaningless to reason about. See docs/06_DECISIONS.md ADR-051.
export class GameWatchlistPremiumRequiredError extends Error {
  constructor() {
    super("Following a whole game requires Premium.");
    this.name = "GameWatchlistPremiumRequiredError";
  }
}

export const gameWatchlistService = {
  async getByUser(userId: string) {
    return getGameWatchlistsByUser(userId);
  },

  async follow(userId: string, gameId: string) {
    const plan = await getUserPlan(userId);

    if (plan !== PLANS.PREMIUM) {
      throw new GameWatchlistPremiumRequiredError();
    }

    return createGameWatchlist(userId, gameId);
  },

  async unfollow(userId: string, gameId: string) {
    return deleteGameWatchlist(userId, gameId);
  },
};
