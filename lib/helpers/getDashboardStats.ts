import { eventService } from "@/lib/services/event.service";

export async function getDashboardStats() {
  const events = await eventService.getAllEvents();

  return {
    watched: events.length,

    live: events.filter(
      (event) => event.status === "LIVE"
    ).length,

    nextEvent:
      events.find(
        (event) => event.status === "UPCOMING"
      )?.title ?? "Unknown",
  };
}