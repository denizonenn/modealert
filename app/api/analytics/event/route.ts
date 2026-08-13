import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { analyticsService } from "@/lib/services/analytics.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { analyticsEventSchema } from "@/lib/validation/schemas";
import type { AnalyticsEventName } from "@/lib/constants/analytics-events";

// Signed-in users only, by design — no anonymous/pre-signup tracking,
// no cookies, no third-party script. See docs/06_DECISIONS.md ADR-046
// for why that scope is a deliberate, honest limit rather than a gap.
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, analyticsEventSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await analyticsService.record(
    session.user.id,
    parsed.data.name as AnalyticsEventName,
    parsed.data.detail
  );

  return NextResponse.json({ success: true });
});
