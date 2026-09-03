import { NextRequest, NextResponse } from "next/server";

import { withErrorHandling } from "@/lib/api/with-error-handling";
import { verifyApiKey } from "@/lib/api/verify-api-key";
import { eventQueryService } from "@/lib/services/event-query.service";
import { eventHistoryService } from "@/lib/services/event-history.service";
import { serializeHistoryEntry } from "@/lib/api/v1/serialize";

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

  const history = event.seriesKey
    ? await eventHistoryService.getBySeriesKey(event.seriesKey)
    : await eventHistoryService.getByEvent(event.id);

  return NextResponse.json({
    data: history.map(serializeHistoryEntry),
  });
});
