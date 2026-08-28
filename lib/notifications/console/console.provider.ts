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

export const consoleNotificationProvider: NotificationProvider =
  {
    id: "console",

    name: "Console",

    enabled: true,

    async send(
      recipient: NotificationRecipient,
      event: ProviderEvent,
      previous: EventWithGame | null
    ) {
      // Debug-only sink — logs raw status codes, not built copy, so
      // it has no use for the recipient's dictionary.
      console.log("");

      console.log(
        "================================"
      );

      console.log(
        "[Console Notification]"
      );

      console.log(
        "Recipient:",
        recipient.email
      );

      console.log(
        "Event:",
        event.title
      );

      console.log(
        "Previous:",
        previous?.status ?? "NONE"
      );

      console.log(
        "Current:",
        event.status
      );

      console.log(
        "================================"
      );
    },
  };
