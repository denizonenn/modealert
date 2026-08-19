import { NextRequest } from "next/server";

import { checkAndRecordHit } from "@/lib/repositories/rate-limit.repository";

// Vercel sets this on every request; falls back to "unknown" for
// local/non-proxied requests rather than throwing (a rate limit check
// should never be why a real request fails).
export function getClientIp(
  request: NextRequest | Request
): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

// Fixed-window counter, Postgres-backed (see docs/06_DECISIONS.md
// ADR-045 for why not Redis). The count check and the hit record are
// done atomically (advisory-lock-protected, see the repository
// function) — real concurrent requests for the same key genuinely
// can't slip past the limit as a burst, not just "usually can't."
export async function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);

  return checkAndRecordHit(key, windowStart, limit);
}
