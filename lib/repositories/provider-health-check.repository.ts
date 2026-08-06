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
