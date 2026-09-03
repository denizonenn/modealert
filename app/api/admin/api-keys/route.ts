import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import {
  createApiKeySchema,
  revokeApiKeySchema,
} from "@/lib/validation/schemas";
import { apiKeyService } from "@/lib/services/api-key.service";

async function requireAdmin() {
  const session = await auth();
  return isAdminEmail(session?.user?.email);
}

// Manual-approval issuance for the public API (see docs/09_BACKLOG.md
// "Sellable API") — no self-serve signup yet, an admin creates a key
// for a known developer's account by email. Returns the raw key
// exactly once; only its hash is ever persisted.
export const POST = withErrorHandling(async (request: NextRequest) => {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, createApiKeySchema);
  if (parsed.error) {
    return parsed.error;
  }

  const { email, name } = parsed.data;
  const result = await apiKeyService.createForEmail(email, name);

  if ("error" in result) {
    return NextResponse.json(
      { error: "No account found for that email." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    rawKey: result.rawKey,
    id: result.record.id,
    keyPrefix: result.record.keyPrefix,
  });
});

export const GET = withErrorHandling(async () => {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await apiKeyService.listAll();

  return NextResponse.json({
    data: keys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      email: key.user.email,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      revokedAt: key.revokedAt,
    })),
  });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, revokeApiKeySchema);
  if (parsed.error) {
    return parsed.error;
  }

  await apiKeyService.revoke(parsed.data.id);

  return NextResponse.json({ success: true });
});
