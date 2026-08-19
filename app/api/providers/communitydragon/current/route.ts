import {
  NextResponse,
} from "next/server";

import {
  communityDragonService,
} from "@/lib/providers/communitydragon/service";

import { logger } from "@/lib/logger/logger";

export async function GET() {
  try {
    const status =
      await communityDragonService.getCurrentStatus();

    return NextResponse.json({
      success: true,

      ...status,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    logger.error("CommunityDragon current-status fetch failed", {
      error: message,
    });

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
