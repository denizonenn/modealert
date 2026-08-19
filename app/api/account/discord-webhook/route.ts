import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { discordWebhookSchema } from "@/lib/validation/schemas";

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, discordWebhookSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      discordWebhookUrl: parsed.data.discordWebhookUrl || null,
    },
  });

  return NextResponse.json({ success: true });
});
