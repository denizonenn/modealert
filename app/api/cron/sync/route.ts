import {
  NextRequest,
  NextResponse,
} from "next/server";

import { env } from "@/lib/config/env";

import {
  providerSyncService,
} from "@/lib/services/provider-sync.service";

export async function GET(
  request: NextRequest
) {
  const authHeader =
    request.headers.get(
      "authorization"
    );

  if (
    authHeader !==
    `Bearer ${env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const { results, durationMs } =
      await providerSyncService.syncAll();

    return NextResponse.json({
      success: true,

      results,

      durationMs,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}