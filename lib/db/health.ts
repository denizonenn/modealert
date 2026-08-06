import { prisma } from "@/lib/db/prisma";

export interface DatabaseHealth {
  healthy: boolean;
  latencyMs: number;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      healthy: true,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      healthy: false,
      latencyMs: Date.now() - startedAt,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    };
  }
}
