import {
  eventHistoryService,
} from "@/lib/services/event-history.service";

import {
  eventStatisticsService,
} from "@/lib/services/event-statistics.service";

// How long an event has typically been LIVE/TRACKING each time it's
// appeared (existing "predict" below), vs how long it typically waits
// between one occurrence ending and the next one starting — a
// separate question, only answerable once an event has completed at
// least 2 occurrences under the same tracked id. Requires no new
// storage: the same EventHistory rows already used for
// average-duration stats also carry the gaps between them.
export function computeRecurrence(
  history: Array<{ startedAt: Date; endedAt: Date | null }>
) {
  const completed = history.filter(
    (item) => item.endedAt !== null
  ) as Array<{ startedAt: Date; endedAt: Date }>;

  const gaps: number[] = [];

  for (let i = 0; i < completed.length - 1; i++) {
    const gap =
      completed[i + 1].startedAt.getTime() -
      completed[i].endedAt.getTime();

    // A negative/zero gap means back-to-back occurrences with no real
    // downtime between them (e.g. an Act I pass rolling straight into
    // Act II) — not a meaningful "how long until it comes back"
    // signal, so it's excluded rather than dragging the average down.
    if (gap > 0) {
      gaps.push(gap);
    }
  }

  if (gaps.length === 0) {
    return {
      averageGapMs: null,
      gapCount: 0,
    };
  }

  const averageGapMs =
    gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

  return {
    averageGapMs,
    gapCount: gaps.length,
  };
}

export const eventPredictionService = {
  async predictNextArrival(
    eventId: string
  ) {
    const history =
      await eventHistoryService.getByEvent(
        eventId
      );

    const active = history.find(
      (item) => item.endedAt === null
    );

    // Only meaningful for something that isn't currently happening —
    // if it's live/tracking right now, "when does it come back" isn't
    // the relevant question yet.
    if (active) {
      return { available: false as const };
    }

    const lastEnded = history
      .filter(
        (item): item is typeof item & { endedAt: Date } =>
          item.endedAt !== null
      )
      .at(-1);

    if (!lastEnded) {
      return { available: false as const };
    }

    const { averageGapMs, gapCount } =
      computeRecurrence(history);

    if (averageGapMs === null) {
      return {
        available: true as const,
        nextExpectedAt: null,
        confidence: 0,
      };
    }

    const nextExpectedAt = new Date(
      lastEnded.endedAt.getTime() + averageGapMs
    );

    return {
      available: true as const,
      nextExpectedAt,
      recurrenceIntervalMs: averageGapMs,
      confidence: Math.min(100, gapCount * 20),
    };
  },

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