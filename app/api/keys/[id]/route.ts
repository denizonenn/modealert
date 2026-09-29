import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { apiKeyService } from "@/lib/services/api-key.service";

// Revokes a key from the signed-in user's own account only —
// apiKeyService.revokeOwn checks ownership, so passing another
// user's key id here 404s instead of revoking it.
export const DELETE = withErrorHandling(async (
  _request: NextRequest,
  context: unknown
) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await (
    context as { params: Promise<{ id: string }> }
  ).params;

  const result = await apiKeyService.revokeOwn(id, session.user.id);

  if ("error" in result) {
    return NextResponse.json({ error: "Key not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});
