import {
  getEvents,
  getEventById,
  getEventsByGame,
} from "@/lib/repositories/event.repository";

import { isProviderEnabled } from "@/lib/providers/core/registry";

// Same rule as event-query.service: a disabled provider's last sync is
// a frozen snapshot, never shown as current data.
async function getEnabledEvents() {
  const events = await getEvents();

  return events.filter((event) => isProviderEnabled(event.source));
}

export const eventService = {
  async getAllEvents() {
    return getEnabledEvents();
  },

  async getById(id: string) {
    return getEventById(id);
  },

  async getByGame(gameId: string) {
    const events = await getEventsByGame(gameId);

    return events.filter((event) => isProviderEnabled(event.source));
  },

  async getLiveEvents() {
    const events = await getEnabledEvents();

    return events.filter(
      (event) => event.status === "LIVE"
    );
  },

  async getUpcomingEvents() {
    const events = await getEnabledEvents();

    return events.filter(
      (event) => event.status === "UPCOMING"
    );
  },
};