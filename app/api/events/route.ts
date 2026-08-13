import { NextResponse } from "next/server";
import { getEvents } from "@/lib/repositories/event.repository";
import { withErrorHandling } from "@/lib/api/with-error-handling";

export const GET = withErrorHandling(async () => {
  const events = await getEvents();

  return NextResponse.json(events);
});