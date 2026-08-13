import { prisma } from "@/lib/db/prisma";

export async function createHealthCheck(data: {
  providerId: string;
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}) {
  return prisma.providerHealthCheck.create({
    data,
  });
}

// Most-recent-first — used to detect a provider that just crossed
// into "unhealthy on 2 checks in a row" (see health-alert.service.ts).
export async function getRecentHealthChecks(
  providerId: string,
  limit: number
) {
  return prisma.providerHealthCheck.findMany({
    where: { providerId },
    orderBy: { checkedAt: "desc" },
    take: limit,
  });
}

export async function getUptimeByProvider(
  since: Date
) {
  const rows = await prisma.providerHealthCheck.groupBy({
    by: ["providerId", "healthy"],

    where: {
      checkedAt: {
        gte: since,
      },
    },

    _count: {
      _all: true,
    },
  });

  return rows;
}
