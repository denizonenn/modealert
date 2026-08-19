import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { billingService } from "@/lib/services/billing.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { profileSchema } from "@/lib/validation/schemas";

export const GET = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const [user, billing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        password: true,
        emailOptOut: true,
        discordWebhookUrl: true,
      },
    }),
    billingService.getBillingInfo(session.user.id),
  ]);

  if (!user) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    email: user.email,
    name: user.name,
    hasPassword: Boolean(user.password),
    emailOptOut: user.emailOptOut,
    discordWebhookUrl: user.discordWebhookUrl,
    plan: billing?.plan ?? "FREE",
    subscriptionStatus: billing?.subscriptionStatus ?? null,
    subscriptionRenewsAt: billing?.subscriptionRenewsAt ?? null,
    manageSubscriptionUrl: billing?.manageUrl ?? null,
    checkoutUrl: billingService.getCheckoutUrl(
      session.user.id,
      user.email
    ),
  });
});

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, profileSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  return NextResponse.json({ success: true });
});

export const DELETE = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Best-effort — a Lemon Squeezy hiccup shouldn't block account
  // deletion, but skipping this would leave a Premium subscription
  // billing an account that no longer exists.
  await billingService.cancelSubscriptionForUser(session.user.id);

  await prisma.user.delete({
    where: { id: session.user.id },
  });

  return NextResponse.json({ success: true });
});
