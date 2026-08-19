import { Resend } from "resend";

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

import { buildEmailHtml } from "./template";
import { createUnsubscribeToken } from "./unsubscribe-token";

import { env } from "@/lib/config/env";
import { SITE_URL } from "@/lib/constants/site";

const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

export const emailNotificationProvider: NotificationProvider =
  {
    id: "email",

    name: "Email",

    enabled: Boolean(
      env.RESEND_API_KEY
    ),

    async send(
      recipient: NotificationRecipient,
      event: ProviderEvent,
      previous: EventWithGame | null
    ) {
      if (!resend) {
        return;
      }

      const { title, message } =
        buildNotificationContent(
          event,
          previous
        );

      const unsubscribeToken =
        createUnsubscribeToken(recipient.id);

      const unsubscribeUrl =
        `${SITE_URL}/api/unsubscribe?userId=${recipient.id}&token=${unsubscribeToken}`;

      // Only the already-synced row has a slug — a brand-new event
      // has no DB row yet at notification time, so it gets no link
      // rather than a guessed (and 404-ing) one.
      const eventUrl = previous?.slug
        ? `${SITE_URL}/events/${previous.slug}`
        : undefined;

      await resend.emails.send({
        from: env.EMAIL_FROM,

        to: recipient.email,

        subject: title,

        text: eventUrl
          ? `${message}\n\nView event: ${eventUrl}\n\nUnsubscribe: ${unsubscribeUrl}`
          : `${message}\n\nUnsubscribe: ${unsubscribeUrl}`,

        html: buildEmailHtml(
          title,
          message,
          unsubscribeUrl,
          eventUrl
        ),
      });
    },
  };
