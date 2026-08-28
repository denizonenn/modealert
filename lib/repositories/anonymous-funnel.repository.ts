import { prisma } from "@/lib/db/prisma";

export async function createAnonymousFunnelEvent(name: string) {
  return prisma.anonymousFunnelEvent.create({ data: { name } });
}

export async function getAnonymousFunnelCounts(since: Date) {
  const rows = await prisma.anonymousFunnelEvent.groupBy({
    by: ["name"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });

  return rows.map((row) => ({
    name: row.name,
    count: row._count._all,
  }));
}
