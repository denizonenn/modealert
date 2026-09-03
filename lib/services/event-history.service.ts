import {
  createHistory,
  closeHistory,
  getLatestHistory,
  getHistoryByEvent,
  getHistoryByEventIds,
  getHistoryBySeriesKey,
  getHistoryBySeriesKeys,
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

  async getByEventIds(eventIds: string[]) {
    return getHistoryByEventIds(eventIds);
  },

  async getBySeriesKeys(seriesKeys: string[]) {
    return getHistoryBySeriesKeys(seriesKeys);
  },
};