import {
  NextResponse,
} from "next/server";

import {
  riotClient,
} from "@/lib/providers/riot/client";

import {
  RIOT_PLATFORM_STATUS_ENDPOINT,
} from "@/lib/providers/riot/constants";

export async function GET() {
  try {
    const response =
      await riotClient.get(
        RIOT_PLATFORM_STATUS_ENDPOINT
      );

    return NextResponse.json({
      success: true,
      data: response,
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