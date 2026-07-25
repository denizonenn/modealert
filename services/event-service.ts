import { events } from "@/lib/data/events";
import { Event } from "@/types/event";

export const eventService = {
  async getEvents(): Promise<Event[]> {
    return Promise.resolve(events);
  },

  async getFeaturedEvents(): Promise<Event[]> {
    return Promise.resolve(
      events.filter((event) => event.featured)
    );
  },

  async getEventsByGame(gameId: string) {
    return Promise.resolve(
      events.filter((event) => event.gameId === gameId)
    );
  },
};