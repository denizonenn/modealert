import {
  eventHistoryService,
} from "@/lib/services/event-history.service";

export function computeStatistics(
  history: Array<{ startedAt: Date; endedAt: Date | null }>
) {
  const completed =
    history.filter(
      (item) => item.endedAt
    );

  const appearanceCount =
    history.length;

  const totalDuration =
    completed.reduce(
      (sum, item) => {
        return (
          sum +
          (item.endedAt!.getTime() -
            item.startedAt.getTime())
        );
      },
      0
    );

  const averageDuration =
    completed.length === 0
      ? 0
      : Math.round(
          totalDuration /
            completed.length
        );

  return {
    appearanceCount,

    averageDuration,

    firstSeen:
      history[0]?.startedAt ??
      null,

    lastSeen:
      history.at(-1)
        ?.startedAt ?? null,
  };
}

export const eventStatisticsService = {
  async getByEvent(
    eventId: string
  ) {
    const history =
      await eventHistoryService.getByEvent(
        eventId
      );

    return computeStatistics(history);
  },

  async getBySeriesKey(
    seriesKey: string
  ) {
    const history =
      await eventHistoryService.getBySeriesKey(
        seriesKey
      );

    return computeStatistics(history);
  },

  // Batched version of getByEvent() for many events at once — one
  // round trip instead of one per event. Used by /games/[slug], which
  // otherwise fires a history query per event on every request (see
  // docs/06_DECISIONS.md ADR-059, same fix predictMany() already
  // applied to /calendar).
  async getManyByEvent(
    eventIds: string[]
  ): Promise<Map<string, ReturnType<typeof computeStatistics>>> {
    const historyByEventId =
      await eventHistoryService.getByEventIds(eventIds);

    return new Map(
      eventIds.map((eventId) => [
        eventId,
        computeStatistics(historyByEventId.get(eventId) ?? []),
      ])
    );
  },
};
