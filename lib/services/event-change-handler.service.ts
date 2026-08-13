import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import {
  eventChangeDetectorService,
} from "@/lib/services/event-change-detector.service";

import {
  eventChangeService,
} from "@/lib/services/event-change.service";

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

    // Only real edits to an already-existing event get logged — a
    // brand-new event's first sync has nothing to diff against.
    if (
      result.previous &&
      result.fieldChanges.length > 0
    ) {
      await Promise.all(
        result.fieldChanges.map(
          (change) =>
            eventChangeService.record({
              eventId: event.id,

              field: change.field,

              oldValue: change.oldValue,

              newValue: change.newValue,
            })
        )
      );
    }

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
