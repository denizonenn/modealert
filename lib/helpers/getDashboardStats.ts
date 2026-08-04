import { watchlistService } from "@/lib/services/watchlist.service";

export async function getDashboardStats(
  userId = "demo"
) {
  const watchlists = await watchlistService.getByUser(
    userId
  );

  const events = watchlists.map(
    (watchlist) => watchlist.event
  );

  return {
    watched: events.length,

    live: events.filter(
      (event) => event.status === "LIVE"
    ).length,

    nextEvent:
      events.find(
        (event) => event.status === "UPCOMING"
      )?.title ?? "None yet",
  };
}
