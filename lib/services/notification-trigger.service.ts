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

import type {
  NotificationProvider,
  NotificationRecipient,
} from "@/lib/notifications/core/notification-provider";

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetry(
  provider: NotificationProvider,
  recipient: NotificationRecipient,
  event: ProviderEvent,
  previous: EventWithGame | null
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      await provider.send(recipient, event, previous);
      return;
    } catch (error) {
      lastError = error;

      if (attempt < RETRY_ATTEMPTS) {
        await wait(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}

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
              await sendWithRetry(
                provider,
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
