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

import { env } from "@/lib/config/env";

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

      await resend.emails.send({
        from: env.EMAIL_FROM,

        to: recipient.email,

        subject: title,

        text: message,

        html: buildEmailHtml(
          title,
          message
        ),
      });
    },
  };
