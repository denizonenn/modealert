import { prisma } from "@/lib/db/prisma";

export async function getWatchlistsByUser(
  userId: string
) {
  return prisma.watchlist.findMany({
    where: {
      userId,
    },
    include: {
      event: {
        include: {
          game: true,
        },
      },
    },
  });
}

export async function getWatchlistsByEvent(
  eventId: string
) {
  return prisma.watchlist.findMany({
    where: {
      eventId,
    },
    include: {
      user: true,
      event: {
        include: {
          game: true,
        },
      },
    },
  });
}

export async function getTrackedUserCountsByGame(): Promise<
  Record<string, number>
> {
  const rows = await prisma.watchlist.findMany({
    select: {
      userId: true,
      event: {
        select: {
          gameId: true,
        },
      },
    },
  });

  const byGame = new Map<string, Set<string>>();

  for (const row of rows) {
    const gameId = row.event.gameId;
    const userIds = byGame.get(gameId) ?? new Set<string>();

    userIds.add(row.userId);
    byGame.set(gameId, userIds);
  }

  const counts: Record<string, number> = {};

  for (const [gameId, userIds] of byGame) {
    counts[gameId] = userIds.size;
  }

  return counts;
}

// Real popularity, computed at read time rather than trusted from
// Event.trackedUsers — every provider writes that column as a
// hardcoded 0 (it has no way to know real watchlist counts), so
// nothing has ever overridden it since the column was added. Same
// "DB column is decorative, the service layer computes the real
// value" pattern as Game.activeUsers (see game.service.ts, ADR-007).
export async function getTrackedUserCountsByEvent(): Promise<
  Record<string, number>
> {
  const rows = await prisma.watchlist.groupBy({
    by: ["eventId"],
    _count: { userId: true },
  });

  return Object.fromEntries(
    rows.map((row) => [row.eventId, row._count.userId])
  );
}

export async function getTrackedUserCount(
  eventId: string
): Promise<number> {
  return prisma.watchlist.count({
    where: { eventId },
  });
}

// Real collaborative filtering: of the users who track `eventId`,
// which other real events do they also track most, ranked by how
// many of them do. No fabrication, no LLM guess — pure aggregation
// over real Watchlist rows. Returns raw eventId+count pairs; the
// service layer resolves them to full Event objects for display.
export async function getCommonlyTrackedEventIds(
  eventId: string,
  limit: number
): Promise<Array<{ eventId: string; count: number }>> {
  const trackers = await prisma.watchlist.findMany({
    where: { eventId },
    select: { userId: true },
  });

  const userIds = trackers.map((t) => t.userId);

  if (userIds.length === 0) {
    return [];
  }

  const rows = await prisma.watchlist.groupBy({
    by: ["eventId"],
    where: {
      userId: { in: userIds },
      eventId: { not: eventId },
    },
    _count: { userId: true },
    orderBy: { _count: { userId: "desc" } },
    take: limit,
  });

  return rows.map((row) => ({
    eventId: row.eventId,
    count: row._count.userId,
  }));
}

export async function countWatchlistsByUser(
  userId: string
): Promise<number> {
  return prisma.watchlist.count({
    where: {
      userId,
    },
  });
}

export async function createWatchlist(
  userId: string,
  eventId: string
) {
  return prisma.watchlist.create({
    data: {
      userId,
      eventId,
    },
  });
}

export async function deleteWatchlist(
  userId: string,
  eventId: string
) {
  return prisma.watchlist.delete({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });
}