import { prisma } from "@/lib/db/prisma";

export async function getFeaturedEvents() {
  return prisma.event.findMany({
    take: 4,
    include: {
      game: true,
    },
  });
}