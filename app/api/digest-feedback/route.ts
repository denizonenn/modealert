import { NextRequest, NextResponse } from "next/server";

import { verifyUnsubscribeToken } from "@/lib/notifications/email/unsubscribe-token";
import { analyticsService } from "@/lib/services/analytics.service";
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events";
import { SITE_URL } from "@/lib/constants/site";

// The 1-click "was this useful?" link on the weekly digest email —
// see docs/09_BACKLOG.md "Growth research" for why. No form, no new
// infra: piggybacks on the same signed-userId token the unsubscribe
// link uses, and records a plain AnalyticsEvent already wired into
// the admin funnel panel.
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const token = request.nextUrl.searchParams.get("token");
  const useful = request.nextUrl.searchParams.get("useful") === "1";

  if (!userId || !token || !verifyUnsubscribeToken(userId, token)) {
    return NextResponse.redirect(`${SITE_URL}/digest-feedback?ok=0`);
  }

  await analyticsService.record(
    userId,
    useful
      ? ANALYTICS_EVENTS.DIGEST_MARKED_USEFUL
      : ANALYTICS_EVENTS.DIGEST_MARKED_NOT_USEFUL
  );

  const redirectUrl = new URL(`${SITE_URL}/digest-feedback`);
  redirectUrl.searchParams.set("ok", "1");

  return NextResponse.redirect(redirectUrl);
}
