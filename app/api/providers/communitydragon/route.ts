import {
  NextResponse,
} from "next/server";

import {
  communityDragonService,
} from "@/lib/providers/communitydragon/service";

export async function GET() {
  try {
    await communityDragonService.debug();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
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