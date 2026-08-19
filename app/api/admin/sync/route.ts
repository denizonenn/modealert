import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { providerSyncService } from "@/lib/services/provider-sync.service";
import { logger } from "@/lib/logger/logger";

export async function POST() {
  const session = await auth();

  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
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
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    logger.error("Manual admin sync failed", { error: message });

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
