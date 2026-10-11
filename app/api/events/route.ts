import { NextResponse } from "next/server";
import { eventQueryService } from "@/lib/services/event-query.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";

export const GET = withErrorHandling(async () => {
  // Through the service, not the repository: it hides rows from
  // disabled providers and fills in real trackedUsers counts.
  const events = await eventQueryService.getAll();

  return NextResponse.json(events);
});