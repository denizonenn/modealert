import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { createOwnApiKeySchema } from "@/lib/validation/schemas";
import { apiKeyService, MAX_KEYS_PER_USER } from "@/lib/services/api-key.service";

// Self-serve API key management for the signed-in user's own account
// (docs/09_BACKLOG.md "Sellable API"). The admin route
// (/api/admin/api-keys) still exists separately for issuing a key to
// someone else's account by email — this one only ever acts on the
// caller's own.
export const GET = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await apiKeyService.listForUser(session.user.id);

  const data = await Promise.all(
    keys.map(async (key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      revokedAt: key.revokedAt,
      usage: await apiKeyService.usageFor(key.id),
    }))
  );

  return NextResponse.json({ data, limit: MAX_KEYS_PER_USER });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, createOwnApiKeySchema);
  if (parsed.error) {
    return parsed.error;
  }

  const result = await apiKeyService.createForUser(
    session.user.id,
    parsed.data.name
  );

  if ("error" in result) {
    return NextResponse.json(
      {
        error: `You already have ${MAX_KEYS_PER_USER} active keys. Revoke one first.`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    rawKey: result.rawKey,
    id: result.record.id,
    keyPrefix: result.record.keyPrefix,
  });
});
