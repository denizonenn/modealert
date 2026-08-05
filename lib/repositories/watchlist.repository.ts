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