import {
  getAllHistory,
} from "@/lib/repositories/event-history.repository";

import {
  getNotificationStats,
  getFalsePositiveStats,
} from "@/lib/repositories/notification.repository";

import {
  getNotificationFailureCount,
} from "@/lib/repositories/notification-failure.repository";

import {
  getUptimeByProvider,
} from "@/lib/repositories/provider-health-check.repository";

import {
  getProviderName,
} from "@/lib/providers/core/registry";

import { eventQueryService } from "@/lib/services/event-query.service";

import {
  EVENT_CATEGORY_LABELS,
  EVENT_CATEGORY_ORDER,
  type EventCategory,
} from "@/lib/constants/event-category";

const UPTIME_WINDOW_DAYS = 30;

// Popularity heatmap: real per-event trackedUsers (ADR-047 — computed
// at read time from actual Watchlist rows, not the always-0 DB column)
// summed by game × category. Purely an aggregation of an existing real
// signal, no new data.
async function computePopularity() {
  const events = await eventQueryService.getAll();

  const gameNames = new Map<string, string>();
  const cellValues = new Map<string, number>();

  for (const event of events) {
    gameNames.set(event.gameId, event.game.name);

    const key = `${event.gameId}::${event.category}`;
    cellValues.set(
      key,
      (cellValues.get(key) ?? 0) + event.trackedUsers
    );
  }

  const gameTotals = new Map<string, number>();

  for (const [key, value] of cellValues) {
    const [gameId] = key.split("::");
    gameTotals.set(gameId, (gameTotals.get(gameId) ?? 0) + value);
  }

  const games = [...gameNames.entries()]
    .map(([gameId, gameName]) => ({
      gameId,
      gameName,
      total: gameTotals.get(gameId) ?? 0,
    }))
    // Most-tracked game first — the heatmap's most useful default sort.
    .sort(
      (a, b) => b.total - a.total || a.gameName.localeCompare(b.gameName)
    );

  const cells = games.flatMap(({ gameId }) =>
    EVENT_CATEGORY_ORDER.map((category) => ({
      gameId,
      category,
      value: cellValues.get(`${gameId}::${category}`) ?? 0,
    }))
  );

  const maxValue = Math.max(0, ...cells.map((cell) => cell.value));

  return {
    games: games.map(({ gameId, gameName }) => ({ gameId, gameName })),
    categories: EVENT_CATEGORY_ORDER.map((category) => ({
      category,
      label: EVENT_CATEGORY_LABELS[category as EventCategory],
    })),
    cells,
    maxValue,
  };
}

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
    const since = new Date(
      Date.now() -
        UPTIME_WINDOW_DAYS *
          24 *
          60 *
          60 *
          1000
    );

    const [
      history,
      notifications,
      healthChecks,
      notificationFailures30d,
      falsePositives,
      popularity,
    ] = await Promise.all([
      getAllHistory(),
      getNotificationStats(),
      getUptimeByProvider(since),
      getNotificationFailureCount(since),
      getFalsePositiveStats(),
      computePopularity(),
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

    const uptimeByProvider = new Map<
      string,
      { healthy: number; total: number }
    >();

    for (const row of healthChecks) {
      const stats =
        uptimeByProvider.get(
          row.providerId
        ) ?? { healthy: 0, total: 0 };

      stats.total += row._count._all;

      if (row.healthy) {
        stats.healthy +=
          row._count._all;
      }

      uptimeByProvider.set(
        row.providerId,
        stats
      );
    }

    const providerUptime = [
      ...uptimeByProvider.entries(),
    ]
      .map(([providerId, stats]) => ({
        providerId,
        providerName:
          getProviderName(providerId),
        uptimePercent: Math.round(
          (stats.healthy /
            stats.total) *
            1000
        ) / 10,
        sampleSize: stats.total,
      }))
      .sort(
        (a, b) =>
          a.providerName.localeCompare(
            b.providerName
          )
      );

    return {
      mostCommon,

      popularity,

      providerUptime: {
        windowDays:
          UPTIME_WINDOW_DAYS,
        providers: providerUptime,
      },

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

      notifications: {
        ...notifications,

        failedLast30Days:
          notificationFailures30d,

        // Only meaningful once there's at least one attempt (success
        // or failure) in the window — otherwise "100%" would be a
        // misleading way to say "no data."
        successRate30d:
          notifications.last30Days +
            notificationFailures30d ===
          0
            ? null
            : Math.round(
                (notifications.last30Days /
                  (notifications.last30Days +
                    notificationFailures30d)) *
                  1000
              ) / 10,

        falsePositives: {
          totalReported:
            falsePositives.totalReported,

          // Real user reports, not an inferred/guessed signal — see
          // docs/06_DECISIONS.md ADR-040. Rate is against all-time
          // sends (a report can come in long after the 30-day window
          // a notification was sent in), so this is deliberately not
          // "reports in the last 30 days / sends in the last 30
          // days" — that would understate it.
          rate:
            notifications.total === 0
              ? null
              : Math.round(
                  (falsePositives.totalReported /
                    notifications.total) *
                    1000
                ) / 10,
        },
      },
    };
  },
};
