import {
  NextResponse,
} from "next/server";

import {
  providerHealthService,
} from "@/lib/providers/core/health.service";

import {
  checkDatabaseHealth,
} from "@/lib/db/health";

import { logger } from "@/lib/logger/logger";

export async function GET() {
  try {
    const [providers, database] =
      await Promise.all([
        providerHealthService.check(),
        checkDatabaseHealth(),
      ]);

    return NextResponse.json({
      success: true,

      providers,

      database,

      checkedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Provider/database health check failed", {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to check providers",
      },
      {
        status: 500,
      }
    );
  }
}