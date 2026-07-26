import { gameService } from "./game.service";
import { eventService } from "./event.service";
import { notificationService } from "./notification.service";
import { watchlistService } from "./watchlist.service";

export async function getDashboardData(userId: string) {
  const games =
    await gameService.getAllGames();

  const events =
    await eventService.getAllEvents();

  const notifications =
    await notificationService.getByUser(userId);

  const watchlists =
    await watchlistService.getByUser(userId);

  return {
    stats: {
      games: games.length,

      events: events.length,

      notifications: notifications.length,

      watchlists: watchlists.length,
    },

    recentEvents: events.slice(0, 5),

    notifications: notifications.slice(0, 5),

    watchlists,
  };
}