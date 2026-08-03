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