import type {
  NotificationProvider,
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
      event: ProviderEvent,
      previous: EventWithGame | null
    ) {
      console.log("");

      console.log(
        "================================"
      );

      console.log(
        "[Console Notification]"
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