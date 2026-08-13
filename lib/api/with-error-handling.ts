import { NextRequest, NextResponse } from "next/server";

type RouteHandler = (
  request: NextRequest,
  context: unknown
) => Promise<NextResponse>;

// Wraps a route handler so an unexpected error (a bad Prisma call, a
// third-party API throwing, anything not already handled inline)
// returns a clean JSON 500 instead of an unhandled exception —
// applied to every mutating route, matching the try/catch pattern
// that only cron/sync and admin/sync had before this pass (see
// docs/06_DECISIONS.md ADR-045).
export function withErrorHandling(
  handler: RouteHandler
): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("[API]", request.method, request.nextUrl.pathname, error);

      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}
