import { NextRequest, NextResponse } from "next/server";

import { withErrorHandling } from "@/lib/api/with-error-handling";
import { verifyApiKey } from "@/lib/api/verify-api-key";
import { eventQueryService } from "@/lib/services/event-query.service";
import { serializeEvent } from "@/lib/api/v1/serialize";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function parseLimit(raw: string | null): number {
  const parsed = raw ? Number(raw) : DEFAULT_LIMIT;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

function parseOffset(raw: string | null): number {
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

// Filtered/paginated in memory over the full event set (~100 rows) —
// same reasoning as the dashboard's own client-side search: no
// dedicated filtered DB query needed at this scale (see
// docs/09_BACKLOG.md "Search").
export const GET = withErrorHandling(async (request: NextRequest) => {
  const auth = await verifyApiKey(request);
  if (!auth.ok) {
    return auth.response;
  }

  const params = request.nextUrl.searchParams;
  const gameSlug = params.get("game");
  const category = params.get("category");
  const status = params.get("status");
  const limitedTimeParam = params.get("limitedTime");
  const limit = parseLimit(params.get("limit"));
  const offset = parseOffset(params.get("offset"));

  let events = await eventQueryService.getAll();

  if (gameSlug) {
    events = events.filter((event) => event.game.slug === gameSlug);
  }
  if (category) {
    events = events.filter((event) => event.category === category);
  }
  if (status) {
    events = events.filter((event) => event.status === status);
  }
  if (limitedTimeParam !== null) {
    const wantLimited = limitedTimeParam === "true";
    events = events.filter((event) => event.isLimitedTime === wantLimited);
  }

  const total = events.length;
  const page = events.slice(offset, offset + limit);

  return NextResponse.json({
    data: page.map(serializeEvent),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + page.length < total,
    },
  });
});
