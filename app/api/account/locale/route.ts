import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { localeSchema } from "@/lib/validation/schemas";

// The language ModeAlert writes notifications in. Deliberately
// separate from the browsing language (a cookie read by proxy.ts):
// an email is sent from a cron job with no browser attached, so it
// needs a stored preference. See docs/06_DECISIONS.md ADR-054.
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, localeSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { locale: parsed.data.locale },
  });

  return NextResponse.json({ success: true });
});
