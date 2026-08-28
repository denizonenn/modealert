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
  getRecipientsForEvent,
} from "@/lib/repositories/watchlist.repository";

import { retry } from "@/lib/utils/retry";
import { logger } from "@/lib/logger/logger";

import { getDictionaryFor } from "@/lib/i18n/load-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

export const notificationTriggerService = {
  async trigger(
    event: ProviderEvent,
    previous: EventWithGame | null
  ) {
    const recipients =
      await getRecipientsForEvent(
        event.id,
        event.gameId
      );

    if (recipients.length === 0) {
      return;
    }

    const providers =
      getNotificationProviders();

    await Promise.all(
      recipients.map(
        async (user) => {
          // Per recipient, not once per event: two users watching the
          // same event can have different languages, so the copy has
          // to be built inside this loop.
          const locale =
            user.locale && isLocale(user.locale)
              ? user.locale
              : DEFAULT_LOCALE;

          const dict = await getDictionaryFor(locale);

          const { title, message } =
            buildNotificationContent(
              event,
              previous,
              dict
            );

          const recipient = {
            id: user.id,

            email: user.email,

            discordWebhookUrl:
              user.discordWebhookUrl,

            locale,
          };

          for (const provider of providers) {
            if (
              provider.id === "email" &&
              user.emailOptOut
            ) {
              continue;
            }

            if (
              provider.id === "discord" &&
              !user.discordWebhookUrl
            ) {
              continue;
            }

            try {
              await retry(
                () =>
                  provider.send(
                    recipient,
                    event,
                    previous,
                    dict
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

              logger.error(
                "Notification delivery failed after retries",
                {
                  provider: provider.name,
                  recipient: recipient.email,
                  attempts: RETRY_ATTEMPTS,
                  error: errorMessage,
                }
              );
            }
          }
        }
      )
    );

    logger.info("Notified users of event change", {
      eventId: event.id,
      recipients: recipients.length,
    });
  },
};
