import {
  NextResponse,
} from "next/server";

import {
  providerHealthService,
} from "@/lib/providers/core/health.service";

import {
  checkDatabaseHealth,
} from "@/lib/db/health";

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
    console.error(error);

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