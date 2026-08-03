import { prisma } from "@/lib/db/prisma";

export async function getGames() {
  return prisma.game.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getGameById(id: string) {
  return prisma.game.findUnique({
    where: {
      id,
    },
  });
}

export async function getFeaturedGames() {
  return prisma.game.findMany({
    where: {
      featured: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}