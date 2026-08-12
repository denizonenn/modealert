import {
  createHistory,
  closeHistory,
  getLatestHistory,
  getHistoryByEvent,
  getHistoryBySeriesKey,
} from "@/lib/repositories/event-history.repository";

export const eventHistoryService = {
  async start(
    eventId: string,
    status: string
  ) {
    const active =
      await getLatestHistory(
        eventId
      );

    if (active) {
      return active;
    }

    return createHistory(
      eventId,
      status,
      new Date()
    );
  },

  async finish(
    eventId: string
  ) {
    const active =
      await getLatestHistory(
        eventId
      );

    if (!active) {
      return null;
    }

    return closeHistory(
      active.id,
      new Date()
    );
  },

  async getByEvent(
    eventId: string
  ) {
    return getHistoryByEvent(
      eventId
    );
  },

  async getBySeriesKey(
    seriesKey: string
  ) {
    return getHistoryBySeriesKey(
      seriesKey
    );
  },
};