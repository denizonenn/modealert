import type {
  NotificationProvider,
  NotificationRecipient,
} from "../core/notification-provider";

import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

import { buildNotificationContent } from "../core/message-builder";

const REQUEST_TIMEOUT_MS = 10_000;

// Brand accent from app/globals.css's gradient-brand (violet/blue),
// as a Discord embed sidebar color.
const EMBED_COLOR = 0x9333ea;

// Per-user Discord webhook, not a bot: a bot can't DM an arbitrary
// user unless it shares a server with them, which would mean
// ModeAlert running and hosting its own Discord server just for
// this. A webhook the user creates themselves (Discord server
// settings -> Integrations -> Webhooks) needs none of that — it's a
// plain POST endpoint, same trust/complexity class as the email
// provider next to it.
export const discordNotificationProvider: NotificationProvider =
  {
    id: "discord",

    name: "Discord",

    enabled: true,

    async send(
      recipient: NotificationRecipient,
      event: ProviderEvent,
      previous: EventWithGame | null
    ) {
      if (!recipient.discordWebhookUrl) {
        return;
      }

      const { title, message } =
        buildNotificationContent(
          event,
          previous
        );

      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
      );

      try {
        const response = await fetch(
          recipient.discordWebhookUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              embeds: [
                {
                  title,
                  description: message,
                  color: EMBED_COLOR,
                  footer: { text: "ModeAlert" },
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          }
        );

        // Discord returns 204 No Content on success — no body to parse.
        if (!response.ok) {
          throw new Error(
            `Discord webhook returned HTTP ${response.status} ${response.statusText}`
          );
        }
      } finally {
        clearTimeout(timer);
      }
    },
  };
