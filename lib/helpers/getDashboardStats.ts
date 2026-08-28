import { watchlistService } from "@/lib/services/watchlist.service";

export async function getDashboardStats(
  userId: string
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

    // null, not a hardcoded English fallback string — the caller (a UI
    // component, which has the active locale) renders the "no
    // upcoming event" text, since this helper has no locale context.
    nextEvent:
      events.find(
        (event) => event.status === "UPCOMING"
      )?.title ?? null,
  };
}
