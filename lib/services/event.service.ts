import {
  getEvents,
  getEventById,
  getEventsByGame,
} from "@/lib/repositories/event.repository";

export const eventService = {
  async getAllEvents() {
    return getEvents();
  },

  async getById(id: string) {
    return getEventById(id);
  },

  async getByGame(gameId: string) {
    return getEventsByGame(gameId);
  },

  async getLiveEvents() {
    const events = await getEvents();

    return events.filter(
      (event) => event.status === "LIVE"
    );
  },

  async getUpcomingEvents() {
    const events = await getEvents();

    return events.filter(
      (event) => event.status === "UPCOMING"
    );
  },
};