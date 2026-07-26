import { events } from "@/lib/data/events";

export function getDashboardStats() {
  return {
    watched: events.length,

    live: events.filter(
      (x) => x.status === "LIVE"
    ).length,

    nextEvent:
      events.find(
        (x) => x.status === "UPCOMING"
      )?.title ?? "Unknown",
  };
}