import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  eventStatisticsService,
} from "@/lib/services/event-statistics.service";

export async function GET(
  request: NextRequest
) {
  const eventId =
    request.nextUrl.searchParams.get(
      "eventId"
    );

  if (!eventId) {
    return NextResponse.json(
      {
        success: false,
        message:
          "eventId is required",
      },
      {
        status: 400,
      }
    );
  }

  const statistics =
    await eventStatisticsService.getByEvent(
      eventId
    );

  return NextResponse.json({
    success: true,
    statistics,
  });
}