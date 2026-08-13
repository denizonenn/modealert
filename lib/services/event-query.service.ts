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
async function withRealTrackedUsers(
  events: EventWithGame[]
): Promise<EventWithGame[]> {
  const counts = await getTrackedUserCountsByEvent();

  return events.map((event) => ({
    ...event,
    trackedUsers: counts[event.id] ?? 0,
  }));
}

const RECOMMENDATION_LIMIT = 5;

export const eventQueryService = {
  async getAll() {
    const events = await getEvents();

    return withRealTrackedUsers(events);
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
    const events = await getEventsByGame(gameId);

    return withRealTrackedUsers(events);
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
