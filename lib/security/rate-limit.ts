import { NextRequest } from "next/server";

import {
  countRecentHits,
  recordHit,
} from "@/lib/repositories/rate-limit.repository";

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
// ADR-045 for why not Redis). Records the hit as soon as it's counted
// so concurrent requests in the same window still can't slip past the
// limit.
export async function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);

  const count = await countRecentHits(key, windowStart);

  if (count >= limit) {
    return false;
  }

  await recordHit(key);

  return true;
}
