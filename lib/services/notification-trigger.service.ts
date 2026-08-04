import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

import {
  getNotificationProviders,
} from "@/lib/notifications/core/registry";

import {
  buildNotificationContent,
} from "@/lib/notifications/core/message-builder";

import {
  createNotification,
} from "@/lib/repositories/notification.repository";

import {
  getWatchlistsByEvent,
} from "@/lib/repositories/watchlist.repository";

export const notificationTriggerService = {
  async trigger(
    event: ProviderEvent,
    previous: EventWithGame | null
  ) {
    const watchlists =
      await getWatchlistsByEvent(
        event.id
      );

    if (watchlists.length === 0) {
      return;
    }

    const providers =
      getNotificationProviders();

    const { title, message } =
      buildNotificationContent(
        event,
        previous
      );

    await Promise.all(
      watchlists.map(
        async (watchlist) => {
          const recipient = {
            id: watchlist.user.id,

            email:
              watchlist.user.email,
          };

          for (const provider of providers) {
            try {
              await provider.send(
                recipient,
                event,
                previous
              );

              await createNotification(
                {
                  userId:
                    recipient.id,

                  eventId:
                    event.id,

                  title,

                  message,

                  channel:
                    provider.id,
                }
              );
            } catch (error) {
              console.error(
                `[Notification] ${provider.name} failed for ${recipient.email}:`,
                error
              );
            }
          }
        }
      )
    );

    console.log("");

    console.log(
      `Notified ${watchlists.length} users`
    );
  },
};
