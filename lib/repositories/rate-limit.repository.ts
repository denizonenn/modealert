import { prisma } from "@/lib/db/prisma";

export async function countRecentHits(
  key: string,
  since: Date
): Promise<number> {
  return prisma.rateLimitHit.count({
    where: {
      key,
      createdAt: { gte: since },
    },
  });
}

export async function recordHit(key: string) {
  return prisma.rateLimitHit.create({ data: { key } });
}
