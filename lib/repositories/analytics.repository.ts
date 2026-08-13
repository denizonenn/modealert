import { prisma } from "@/lib/db/prisma";

export async function createAnalyticsEvent(data: {
  userId: string;
  name: string;
  detail?: string;
}) {
  return prisma.analyticsEvent.create({ data });
}

export async function getEventCounts(since: Date) {
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });

  return rows.map((row) => ({
    name: row.name,
    count: row._count._all,
  }));
}
