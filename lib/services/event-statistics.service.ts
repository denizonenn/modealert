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
};
