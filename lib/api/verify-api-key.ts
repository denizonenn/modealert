import { NextRequest, NextResponse } from "next/server";

import { apiKeyService } from "@/lib/services/api-key.service";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Generous for now — keys are manually issued (no self-serve/billing
// yet, see docs/09_BACKLOG.md "Sellable API"), so every holder is a
// known, vetted developer, not an anonymous script. Revisit once
// self-serve tiers exist.
const API_LIMIT = 300;
const API_WINDOW_MS = 60 * 60 * 1000;

type ApiKeyAuthResult =
  | { ok: true; keyId: string; userId: string }
  | { ok: false; response: NextResponse };

// Shared guard for every /api/v1/* route: validates the Authorization
// header, then rate-limits by key id (not by IP — a real integration
// behind a shared IP, e.g. a Discord bot host, shouldn't collide with
// other users of the same key).
export async function verifyApiKey(
  request: NextRequest
): Promise<ApiKeyAuthResult> {
  const authHeader = request.headers.get("authorization") ?? "";
  const rawKey = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!rawKey) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Missing API key. Pass it as 'Authorization: Bearer <key>'.",
        },
        { status: 401 }
      ),
    };
  }

  const key = await apiKeyService.verify(rawKey);

  if (!key) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid or revoked API key." },
        { status: 401 }
      ),
    };
  }

  const allowed = await checkRateLimit({
    key: `apikey:${key.id}`,
    limit: API_LIMIT,
    windowMs: API_WINDOW_MS,
  });

  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      ),
    };
  }

  return { ok: true, keyId: key.id, userId: key.userId };
}
