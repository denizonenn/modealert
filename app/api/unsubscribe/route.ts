import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { verifyUnsubscribeToken } from "@/lib/notifications/email/unsubscribe-token";
import { SITE_URL } from "@/lib/constants/site";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const token = request.nextUrl.searchParams.get("token");

  const action =
    request.nextUrl.searchParams.get("action") === "resubscribe"
      ? "resubscribe"
      : "unsubscribe";

  if (!userId || !token || !verifyUnsubscribeToken(userId, token)) {
    return NextResponse.redirect(`${SITE_URL}/unsubscribed?ok=0`);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailOptOut: action === "unsubscribe" },
  });

  const redirectUrl = new URL(`${SITE_URL}/unsubscribed`);
  redirectUrl.searchParams.set("ok", "1");
  redirectUrl.searchParams.set("action", action);
  redirectUrl.searchParams.set("userId", userId);
  redirectUrl.searchParams.set("token", token);

  return NextResponse.redirect(redirectUrl);
}
