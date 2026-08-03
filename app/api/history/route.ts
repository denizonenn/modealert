import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  eventHistoryService,
} from "@/lib/services/event-history.service";

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

  const history =
    await eventHistoryService.getByEvent(
      eventId
    );

  return NextResponse.json({
    success: true,
    history,
  });
}