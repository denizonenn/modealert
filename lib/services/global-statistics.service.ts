import {
  getAllHistory,
} from "@/lib/repositories/event-history.repository";

import {
  getNotificationStats,
} from "@/lib/repositories/notification.repository";

type HistoryWithEvent = Awaited<
  ReturnType<typeof getAllHistory>
>[number];

interface EventGroup {
  eventId: string;
  title: string;
  gameId: string;
  gameName: string;
  slug: string | null;
  entries: HistoryWithEvent[];
}

function groupByEvent(
  history: HistoryWithEvent[]
): EventGroup[] {
  const groups = new Map<string, EventGroup>();

  for (const entry of history) {
    const existing = groups.get(entry.eventId);

    if (existing) {
      existing.entries.push(entry);
      continue;
    }

    groups.set(entry.eventId, {
      eventId: entry.eventId,
      title: entry.event.title,
      gameId: entry.event.gameId,
      gameName: entry.event.game.name,
      slug: entry.event.slug,
      entries: [entry],
    });
  }

  return [...groups.values()];
}

export const globalStatisticsService = {
  async get() {
    const [history, notifications] =
      await Promise.all([
        getAllHistory(),
        getNotificationStats(),
      ]);

    const groups = groupByEvent(history);

    const mostCommon = [...groups]
      .sort(
        (a, b) =>
          b.entries.length -
          a.entries.length
      )
      .slice(0, 10)
      .map((group) => ({
        eventId: group.eventId,
        title: group.title,
        gameName: group.gameName,
        slug: group.slug,
        appearanceCount:
          group.entries.length,
      }));

    // Average duration and prediction accuracy both need at
    // least one *completed* (endedAt set) occurrence — history
    // tracking only started 2026-08-04, so real samples show up
    // gradually rather than all at once.
    let totalDuration = 0;
    let completedCount = 0;

    const byGame = new Map<
      string,
      {
        gameName: string;
        totalDuration: number;
        count: number;
      }
    >();

    let errorSum = 0;
    let predictionSamples = 0;

    for (const group of groups) {
      const completed = group.entries.filter(
        (entry) => entry.endedAt !== null
      );

      const priorDurations: number[] = [];

      for (const entry of completed) {
        const actualDuration =
          entry.endedAt!.getTime() -
          entry.startedAt.getTime();

        if (actualDuration <= 0) continue;

        totalDuration += actualDuration;
        completedCount += 1;

        const gameStats =
          byGame.get(group.gameId) ?? {
            gameName: group.gameName,
            totalDuration: 0,
            count: 0,
          };

        gameStats.totalDuration +=
          actualDuration;
        gameStats.count += 1;
        byGame.set(
          group.gameId,
          gameStats
        );

        // Retrospective accuracy: what would eventPredictionService
        // have predicted for this occurrence using only the
        // occurrences that came before it? Compare that to what
        // actually happened.
        if (priorDurations.length > 0) {
          const predicted =
            priorDurations.reduce(
              (sum, d) => sum + d,
              0
            ) / priorDurations.length;

          const error =
            Math.abs(
              predicted - actualDuration
            ) / actualDuration;

          errorSum += Math.min(error, 1);
          predictionSamples += 1;
        }

        priorDurations.push(
          actualDuration
        );
      }
    }

    return {
      mostCommon,

      averageDuration: {
        overallMs:
          completedCount === 0
            ? null
            : Math.round(
                totalDuration /
                  completedCount
              ),

        sampleSize: completedCount,

        byGame: [...byGame.entries()]
          .map(([gameId, stats]) => ({
            gameId,
            gameName: stats.gameName,
            averageMs: Math.round(
              stats.totalDuration /
                stats.count
            ),
            sampleSize: stats.count,
          }))
          .sort(
            (a, b) =>
              b.sampleSize -
              a.sampleSize
          ),
      },

      predictionAccuracy: {
        score:
          predictionSamples === 0
            ? null
            : Math.round(
                (1 -
                  errorSum /
                    predictionSamples) *
                  100
              ),

        sampleSize:
          predictionSamples,
      },

      notifications,
    };
  },
};
