import { NextRequest, NextResponse } from "next/server";

import { withErrorHandling } from "@/lib/api/with-error-handling";
import { verifyApiKey } from "@/lib/api/verify-api-key";
import { eventQueryService } from "@/lib/services/event-query.service";
import { eventStatisticsService } from "@/lib/services/event-statistics.service";

export const GET = withErrorHandling(async (
  request: NextRequest,
  context: unknown
) => {
  const auth = await verifyApiKey(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { slug } = await (
    context as { params: Promise<{ slug: string }> }
  ).params;

  const event = await eventQueryService.getBySlug(slug);

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const statistics = await eventStatisticsService.getByEvent(event.id);

  return NextResponse.json({ data: statistics });
});
