import {
  getEvents,
  getEventById,
  getEventBySlug,
  getEventsByGame,
} from "@/lib/repositories/event.repository";

export const eventQueryService = {
  async getAll() {
    return getEvents();
  },

  async getById(
    id: string
  ) {
    return getEventById(id);
  },

  async getBySlug(
    slug: string
  ) {
    return getEventBySlug(slug);
  },

  async getByGame(
    gameId: string
  ) {
    return getEventsByGame(gameId);
  },

  async getLive() {
    const events =
      await getEvents();

    return events.filter(
      (event) =>
        event.status === "LIVE"
    );
  },

  async getTracking() {
    const events =
      await getEvents();

    return events.filter(
      (event) =>
        event.status ===
        "TRACKING"
    );
  },

  async getUpcoming() {
    const events =
      await getEvents();

    return events.filter(
      (event) =>
        event.status ===
        "UPCOMING"
    );
  },

  async getEnded() {
    const events =
      await getEvents();

    return events.filter(
      (event) =>
        event.status ===
        "ENDED"
    );
  },
};