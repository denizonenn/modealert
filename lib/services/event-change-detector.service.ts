import {
  getEventById,
} from "@/lib/repositories/event.repository";

import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

export const eventChangeDetectorService = {
  async detect(
    incoming: ProviderEvent
  ) {
    const current =
      await getEventById(
        incoming.id
      );

    if (!current) {
      return {
        changed: true,

        previous: null,
      };
    }

    return {
      changed:
        current.status !==
        incoming.status,

      previous: current,
    };
  },
};