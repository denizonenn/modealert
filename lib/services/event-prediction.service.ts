import {
  eventHistoryService,
} from "@/lib/services/event-history.service";

import {
  computeStatistics,
} from "@/lib/services/event-statistics.service";

import { RESEARCHED_CADENCES } from "@/lib/constants/researched-cadences";

type HistoryEntry = { startedAt: Date; endedAt: Date | null };

// How long an event has typically been LIVE/TRACKING each time it's
// appeared (existing "predict" below), vs how long it typically waits
// between one occurrence ending and the next one starting — a
// separate question, only answerable once an event has completed at
// least 2 occurrences under the same tracked id. Requires no new
// storage: the same EventHistory rows already used for
// average-duration stats also carry the gaps between them.
export function computeRecurrence(
  history: HistoryEntry[]
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

function predictNextArrivalFromHistory(
  history: HistoryEntry[]
) {
  const active = history.find(
    (item) => item.endedAt === null
  );

  // Only meaningful for something that isn't currently happening — if
  // it's live/tracking right now, "when does it come back" isn't the
  // relevant question yet.
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
}

function predictFromHistory(
  history: HistoryEntry[]
) {
  const statistics = computeStatistics(history);

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
}

// Fixed-window formula, same shape as Destiny's mapIronBanner —
// recomputed fresh from a real, sourced anchor + interval every call,
// never a frozen guess. Returns null when no researched cadence
// exists for this event id (the common case — see
// researched-cadences.ts for why most events don't get one).
export function predictFromResearchedCadence(
  eventId: string,
  now: Date
) {
  const cadence = RESEARCHED_CADENCES[eventId];

  if (!cadence) {
    return null;
  }

  const cycleMs = cadence.intervalDays * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - cadence.anchorDate.getTime();
  const cycleIndex = Math.max(0, Math.floor(elapsed / cycleMs));

  const currentCycleStart = new Date(
    cadence.anchorDate.getTime() + cycleIndex * cycleMs
  );

  const predictedEndAt = new Date(
    currentCycleStart.getTime() + cycleMs
  );

  return {
    predictedEndAt,
    remainingMs: Math.max(0, predictedEndAt.getTime() - now.getTime()),
    researched: true as const,
    source: cadence.source,
    verifiedAt: cadence.verifiedAt,
    caveats: cadence.caveats,
  };
}

async function predictWithResearchedFallback(
  eventId: string,
  history: HistoryEntry[]
) {
  const ownPrediction = predictFromHistory(history);

  // Only fall back when our own tracking is currently active but has
  // no real completed-occurrence average yet — never overrides real
  // tracked data once enough of it exists.
  const needsFallback =
    ownPrediction.active &&
    "prediction" in ownPrediction &&
    ownPrediction.prediction === null;

  if (!needsFallback) {
    return ownPrediction;
  }

  const researched = predictFromResearchedCadence(eventId, new Date());

  if (!researched) {
    return ownPrediction;
  }

  return {
    active: true as const,
    ...researched,
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

    return predictNextArrivalFromHistory(history);
  },

  async predictNextArrivalBySeriesKey(
    seriesKey: string
  ) {
    const history =
      await eventHistoryService.getBySeriesKey(
        seriesKey
      );

    return predictNextArrivalFromHistory(history);
  },

  async predict(
    eventId: string
  ) {
    const history =
      await eventHistoryService.getByEvent(
        eventId
      );

    return predictWithResearchedFallback(eventId, history);
  },

  async predictBySeriesKey(
    seriesKey: string
  ) {
    const history =
      await eventHistoryService.getBySeriesKey(
        seriesKey
      );

    return predictWithResearchedFallback(seriesKey, history);
  },
};
