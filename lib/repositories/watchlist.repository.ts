import { Prisma } from "@prisma/client";

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

// Notification recipients for one event: direct per-event followers
// plus anyone following the event's whole game (GameWatchlist — see
// ADR-051), deduped so a user following both only gets one send.
export async function getRecipientsForEvent(
  eventId: string,
  gameId: string
) {
  const [eventWatchers, gameWatchers] = await Promise.all([
    prisma.watchlist.findMany({
      where: { eventId },
      include: { user: true },
    }),
    prisma.gameWatchlist.findMany({
      where: { gameId },
      include: { user: true },
    }),
  ]);

  const byUserId = new Map<
    string,
    (typeof eventWatchers)[number]["user"]
  >();

  for (const row of [...eventWatchers, ...gameWatchers]) {
    byUserId.set(row.user.id, row.user);
  }

  return [...byUserId.values()];
}

export async function getTrackedUserCountsByGame(): Promise<
  Record<string, number>
> {
  // Distinct-user-per-game count needs a join (Watchlist has no
  // gameId of its own) — done as one grouped query so it costs a
  // single DB round trip and scales with distinct games, not with
  // pulling every Watchlist row into Node memory to dedupe there.
  const rows = await prisma.$queryRaw<
    Array<{ gameId: string; count: bigint }>
  >(Prisma.sql`
    SELECT e."gameId" AS "gameId", COUNT(DISTINCT w."userId") AS count
    FROM "Watchlist" w
    JOIN "Event" e ON e.id = w."eventId"
    GROUP BY e."gameId"
  `);

  return Object.fromEntries(
    rows.map((row) => [row.gameId, Number(row.count)])
  );
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

// Combines the free-plan limit check and the insert into one
// pg_advisory_xact_lock-protected transaction (same pattern as
// lib/repositories/rate-limit.repository.ts's checkAndRecordHit) —
// checking the count and creating the row as two separate statements
// let real concurrent requests for the same user (multiple onboarding
// picks submitted together, or just fast repeated star-toggle clicks)
// all read the same pre-insert count and all pass the limit check,
// letting a free user end up with more than FREE_WATCHLIST_LIMIT
// tracked events. Returns `{ limitReached: true }` instead of
// creating the row when the free plan's cap is hit.
export async function createWatchlistWithLimitCheck(
  userId: string,
  eventId: string,
  freeLimit: number
): Promise<
  | { limitReached: true }
  | { limitReached: false; watchlist: Prisma.WatchlistGetPayload<object> }
> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw(
        Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`
      );

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });

      const count = await tx.watchlist.count({
        where: { userId },
      });

      if (user?.plan !== "PREMIUM" && count >= freeLimit) {
        return { limitReached: true as const };
      }

      const watchlist = await tx.watchlist.create({
        data: { userId, eventId },
      });

      return { limitReached: false as const, watchlist };
    },
    { maxWait: 10_000, timeout: 10_000 }
  );
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