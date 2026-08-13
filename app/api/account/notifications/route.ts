import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { emailOptOutSchema } from "@/lib/validation/schemas";

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, emailOptOutSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailOptOut: parsed.data.emailOptOut },
  });

  return NextResponse.json({ success: true });
});
