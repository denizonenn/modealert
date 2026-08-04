import {
  NextResponse,
} from "next/server";

import {
  communityDragonService,
} from "@/lib/providers/communitydragon/service";

export async function GET() {
  try {
    const status =
      await communityDragonService.getCurrentStatus();

    return NextResponse.json({
      success: true,

      ...status,
    });
  } catch (error) {
    console.error(
      "[CommunityDragon current]",
      error
    );

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
