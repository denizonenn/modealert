import { timingSafeEqual } from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { env } from "@/lib/config/env";

import {
  providerSyncService,
} from "@/lib/services/provider-sync.service";
import { weeklyDigestService } from "@/lib/services/weekly-digest.service";
import { logger } from "@/lib/logger/logger";

// Same length-check-then-timingSafeEqual pattern already used for the
// unsubscribe HMAC and the Lemon Squeezy webhook signature — a plain
// !== leaks a timing side-channel on this bearer-token comparison.
function isValidCronAuth(authHeader: string | null): boolean {
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const actual = Buffer.from(authHeader ?? "");

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export async function GET(
  request: NextRequest
) {
  const authHeader =
    request.headers.get(
      "authorization"
    );

  if (!isValidCronAuth(authHeader)) {
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

    let digest: { sent: number; skipped: number } | undefined;

    if (weeklyDigestService.shouldRunToday(new Date())) {
      digest = await weeklyDigestService.sendDigests();
    }

    return NextResponse.json({
      success: true,

      results,

      durationMs,

      digest,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    logger.error("Daily cron sync failed", { error: message });

    return NextResponse.json(
      {
        success: false,

        error: message,
      },
      {
        status: 500,
      }
    );
  }
}