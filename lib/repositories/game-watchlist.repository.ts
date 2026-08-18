import { prisma } from "@/lib/db/prisma";

export async function getGameWatchlistsByUser(userId: string) {
  return prisma.gameWatchlist.findMany({
    where: { userId },
    include: { game: true },
  });
}

export async function getGameWatchlistsByGame(gameId: string) {
  return prisma.gameWatchlist.findMany({
    where: { gameId },
    include: { user: true },
  });
}

export async function isGameWatchlisted(
  userId: string,
  gameId: string
): Promise<boolean> {
  const row = await prisma.gameWatchlist.findUnique({
    where: { userId_gameId: { userId, gameId } },
    select: { id: true },
  });

  return row !== null;
}

export async function createGameWatchlist(
  userId: string,
  gameId: string
) {
  return prisma.gameWatchlist.create({
    data: { userId, gameId },
  });
}

export async function deleteGameWatchlist(
  userId: string,
  gameId: string
) {
  return prisma.gameWatchlist.delete({
    where: { userId_gameId: { userId, gameId } },
  });
}
