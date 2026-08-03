import {
  NextResponse,
} from "next/server";

import {
  providerHealthService,
} from "@/lib/providers/core/health.service";

export async function GET() {
  try {
    const providers =
      await providerHealthService.check();

    return NextResponse.json({
      success: true,

      providers,

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