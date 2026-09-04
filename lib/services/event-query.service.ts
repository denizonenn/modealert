import {
  getEvents,
  getEventById,
  getEventBySlug,
  getEventsByGame,
  getEventsByIds,
} from "@/lib/repositories/event.repository";

import {
  getTrackedUserCount,
  getTrackedUserCountsByEvent,
  getCommonlyTrackedEventIds,
} from "@/lib/repositories/watchlist.repository";

import type { EventWithGame } from "@/lib/repositories/event.repository";

// Event.trackedUsers is written by every provider as a hardcoded 0
// (providers have no way to know real watchlist counts) and never
// overridden anywhere else — same "DB column is decorative, override
// with a real value at read time" fix as Game.activeUsers got in
// ADR-007. See docs/06_DECISIONS.md ADR-047.
// Takes the events fetch as a still-pending promise (not an already-
// resolved array) so it can run concurrently with the trackedUsers
// count query below instead of waiting for it first — the count query
// doesn't depend on the events result at all (see docs/06_DECISIONS.md
// ADR-059).
async function withRealTrackedUsers(
  eventsPromise: Promise<EventWithGame[]>
): Promise<EventWithGame[]> {
  const [events, counts] = await Promise.all([
    eventsPromise,
    getTrackedUserCountsByEvent(),
  ]);

  return events.map((event) => ({
    ...event,
    trackedUsers: counts[event.id] ?? 0,
  }));
}

const RECOMMENDATION_LIMIT = 5;

export const eventQueryService = {
  async getAll() {
    return withRealTrackedUsers(getEvents());
  },

  async getById(
    id: string
  ) {
    const event = await getEventById(id);

    if (!event) {
      return null;
    }

    const trackedUsers = await getTrackedUserCount(id);

    return { ...event, trackedUsers };
  },

  async getBySlug(
    slug: string
  ) {
    const event = await getEventBySlug(slug);

    if (!event) {
      return null;
    }

    const trackedUsers = await getTrackedUserCount(event.id);

    return { ...event, trackedUsers };
  },

  async getByGame(
    gameId: string
  ) {
    return withRealTrackedUsers(getEventsByGame(gameId));
  },

  // Real collaborative filtering, not a guess — see
  // getCommonlyTrackedEventIds. Empty with too little data (a brand
  // new event, or an event nobody else tracks alongside anything)
  // rather than padded out with anything invented.
  async getRecommendationsFor(eventId: string) {
    const related = await getCommonlyTrackedEventIds(
      eventId,
      RECOMMENDATION_LIMIT
    );

    if (related.length === 0) {
      return [];
    }

    const events = await getEventsByIds(
      related.map((r) => r.eventId)
    );

    const countByEventId = new Map(
      related.map((r) => [r.eventId, r.count])
    );

    return events
      .map((event) => ({
        event,
        trackedTogetherCount:
          countByEventId.get(event.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.trackedTogetherCount - a.trackedTogetherCount
      );
  },
};
