import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";

// Marks the current user as having gone through /onboarding, so
// /api/post-auth stops routing them there on future sign-ins. Only
// ever sets it the first time — a returning user re-running
// onboarding (e.g. from /games) shouldn't reset anything.
export const POST = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await prisma.user.updateMany({
    where: { id: session.user.id, onboardedAt: null },
    data: { onboardedAt: new Date() },
  });

  return NextResponse.json({ success: true });
});
