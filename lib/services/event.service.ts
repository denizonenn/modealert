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
};