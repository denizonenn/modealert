import {
  eventHistoryService,
} from "@/lib/services/event-history.service";

import {
  eventStatisticsService,
} from "@/lib/services/event-statistics.service";

export const eventPredictionService = {
  async predict(
    eventId: string
  ) {
    const [
      history,
      statistics,
    ] = await Promise.all([
      eventHistoryService.getByEvent(
        eventId
      ),
      eventStatisticsService.getByEvent(
        eventId
      ),
    ]);

    const active =
      history.find(
        (item) =>
          item.endedAt === null
      );

    if (!active) {
      return {
        active: false,
      };
    }

    if (
      statistics.averageDuration ===
      0
    ) {
      return {
        active: true,

        prediction: null,

        confidence: 0,
      };
    }

    const predictedEndAt =
      new Date(
        active.startedAt.getTime() +
          statistics.averageDuration
      );

    return {
      active: true,

      predictedEndAt,

      remainingMs: Math.max(
        0,
        predictedEndAt.getTime() -
          Date.now()
      ),

      confidence: Math.min(
        100,
        statistics.appearanceCount *
          10
      ),
    };
  },
};