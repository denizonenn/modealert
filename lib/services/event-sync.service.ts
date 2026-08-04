import {
  upsertEvent,
  getEventsBySource,
} from "@/lib/repositories/event.repository";

import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import {
  EVENT_STATUS,
} from "@/lib/constants/event-status";

import {
  eventHistoryService,
} from "@/lib/services/event-history.service";

import {
  eventChangeHandlerService,
} from "@/lib/services/event-change-handler.service";

async function syncHistoryForStatus(
  eventId: string,
  status: string
) {
  if (
    status === EVENT_STATUS.LIVE ||
    status === EVENT_STATUS.TRACKING
  ) {
    await eventHistoryService.start(
      eventId,
      status
    );

    return;
  }

  if (status === EVENT_STATUS.ENDED) {
    await eventHistoryService.finish(
      eventId
    );
  }
}

async function processEvent(
  event: ProviderEvent,
  source: string
) {
  await eventChangeHandlerService.handle(
    event
  );

  const saved =
    await upsertEvent(
      event,
      source
    );

  await syncHistoryForStatus(
    event.id,
    event.status
  );

  return saved;
}

/*
 * A provider no longer reporting an event it previously reported
 * (e.g. a rotation ended, an event hub entry disappeared) means the
 * event is gone. Without this, events removed upstream would stay
 * LIVE/UPCOMING in the database forever with no manual cleanup path.
 */
async function expireStaleEvents(
  events: ProviderEvent[],
  source: string
) {
  const seenIds = new Set(
    events.map((event) => event.id)
  );

  const existing =
    await getEventsBySource(source);

  const stale = existing.filter(
    (event) =>
      !seenIds.has(event.id) &&
      event.status !== EVENT_STATUS.ENDED
  );

  await Promise.all(
    stale.map((event) =>
      processEvent(
        {
          id: event.id,

          gameId: event.gameId,

          title: event.title,

          status: EVENT_STATUS.ENDED,

          trackedUsers:
            event.trackedUsers,

          checkedAt: new Date(),
        },
        source
      )
    )
  );
}

export const eventSyncService = {
  async sync(
    events: ProviderEvent[],
    source: string
  ) {
    const results =
      await Promise.all(
        events.map((event) =>
          processEvent(
            event,
            source
          )
        )
      );

    await expireStaleEvents(
      events,
      source
    );

    return results;
  },
};
