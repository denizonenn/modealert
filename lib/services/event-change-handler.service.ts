import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import {
  eventChangeDetectorService,
} from "@/lib/services/event-change-detector.service";

import {
  notificationTriggerService,
} from "@/lib/services/notification-trigger.service";

export const eventChangeHandlerService = {
  async handle(
    event: ProviderEvent
  ) {
    const result =
      await eventChangeDetectorService.detect(
        event
      );

    if (!result.changed) {
      return {
        changed: false,
      };
    }

    await notificationTriggerService.trigger(
      event,
      result.previous
    );

    return {
      changed: true,
    };
  },
};