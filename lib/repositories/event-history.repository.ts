import { prisma } from "@/lib/db/prisma";

export async function createHistory(
  eventId: string,
  status: string,
  startedAt: Date
) {
  return prisma.eventHistory.create({
    data: {
      eventId,
      status,
      startedAt,
    },
  });
}

export async function closeHistory(
  id: string,
 endedAt: Date
) {
  return prisma.eventHistory.update({
    where: {
      id,
    },
    data: {
      endedAt,
    },
  });
}

export async function getLatestHistory(
  eventId: string
) {
  return prisma.eventHistory.findFirst({
    where: {
      eventId,
      endedAt: null,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}

export async function getHistoryByEvent(
  eventId: string
) {
  return prisma.eventHistory.findMany({
    where: {
      eventId,
    },
    include: {
      event: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      startedAt: "asc",
    },
  });
}

// Combined history across every Event row sharing the same seriesKey
// (e.g. every "Mayhem Set N" pass window) — lets stats/predictions
// look at the full recurring pattern, not just one occurrence's row.
// Includes each entry's own event title since a series timeline spans
// multiple differently-titled rows (e.g. "Season 1: Act I", "Season 2:
// Act I", ...), unlike a single event's own timeline.
export async function getHistoryBySeriesKey(
  seriesKey: string
) {
  return prisma.eventHistory.findMany({
    where: {
      event: {
        seriesKey,
      },
    },
    include: {
      event: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      startedAt: "asc",
    },
  });
}

// Most-recent-first, capped — for the public RSS feed. `getAllHistory`
// pulls the entire table in ascending order, wrong shape and wrong
// cost for "just the latest N".
export async function getRecentHistory(limit: number) {
  return prisma.eventHistory.findMany({
    include: {
      event: {
        include: {
          game: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    take: limit,
  });
}

export async function getAllHistory() {
  return prisma.eventHistory.findMany({
    include: {
      event: {
        include: {
          game: true,
        },
      },
    },
    orderBy: {
      startedAt: "asc",
    },
  });
}