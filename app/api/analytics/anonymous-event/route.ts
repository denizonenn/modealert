import { NextRequest, NextResponse } from "next/server";

import { anonymousFunnelService } from "@/lib/services/anonymous-funnel.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { anonymousFunnelEventSchema } from "@/lib/validation/schemas";
import type { AnonymousFunnelEventName } from "@/lib/constants/anonymous-funnel-events";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

// No auth check here, deliberately — this is the one endpoint that
// records something before a visitor has an account, so
// docs/06_DECISIONS.md ADR-056 (and the updated /privacy copy) apply.
// The IP rate limit isn't about individual abuse protection so much
// as keeping one script/bot from being able to skew the aggregate
// count that ends up on /admin.
const IP_LIMIT = 30;
const IP_WINDOW_MS = 60 * 60 * 1000;

export const POST = withErrorHandling(async (request: NextRequest) => {
  const parsed = await parseJsonBody(request, anonymousFunnelEventSchema);

  if (parsed.error) {
    return parsed.error;
  }

  const ip = getClientIp(request);

  const allowed = await checkRateLimit({
    key: `anonymous-funnel:${ip}`,
    limit: IP_LIMIT,
    windowMs: IP_WINDOW_MS,
  });

  if (!allowed) {
    // Silently accepted from the caller's point of view — this is a
    // best-effort metrics beacon, not something a real visitor should
    // ever see fail.
    return NextResponse.json({ success: true });
  }

  await anonymousFunnelService.record(
    parsed.data.name as AnonymousFunnelEventName
  );

  return NextResponse.json({ success: true });
});
