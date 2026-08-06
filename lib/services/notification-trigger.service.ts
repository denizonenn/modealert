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
  createNotificationFailure,
} from "@/lib/repositories/notification-failure.repository";

import {
  getWatchlistsByEvent,
} from "@/lib/repositories/watchlist.repository";

import { retry } from "@/lib/utils/retry";

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

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
            if (
              provider.id === "email" &&
              watchlist.user.emailOptOut
            ) {
              continue;
            }

            try {
              await retry(
                () =>
                  provider.send(
                    recipient,
                    event,
                    previous
                  ),
                {
                  // RETRY_ATTEMPTS total attempts = 1 initial + (RETRY_ATTEMPTS - 1) retries
                  retries:
                    RETRY_ATTEMPTS - 1,
                  delay:
                    RETRY_DELAY_MS,
                }
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
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error";

              await createNotificationFailure(
                {
                  userId:
                    recipient.id,

                  eventId:
                    event.id,

                  channel:
                    provider.id,

                  error: errorMessage,
                }
              );

              console.error(
                `[Notification] ${provider.name} failed for ${recipient.email} after ${RETRY_ATTEMPTS} attempts:`,
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
