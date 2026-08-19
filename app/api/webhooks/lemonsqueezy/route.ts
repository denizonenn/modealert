import { NextRequest, NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/billing/lemonsqueezy-client";
import { billingService } from "@/lib/services/billing.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { lemonSqueezyWebhookSchema } from "@/lib/validation/schemas";
import { analyticsService } from "@/lib/services/analytics.service";
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events";
import { logger } from "@/lib/logger/logger";

const HANDLED_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
]);

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Signature is computed over the exact raw bytes Lemon Squeezy sent —
  // must read as text before any JSON parsing, or the signature check
  // fails against a re-serialized body.
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let json: unknown;

  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = lemonSqueezyWebhookSchema.safeParse(json);

  if (!parsed.success) {
    // Signed by Lemon Squeezy but a shape we don't recognize — ack it
    // (so they don't retry forever) without acting on it.
    logger.error("Unrecognized Lemon Squeezy webhook payload shape", {
      issues: parsed.error.issues,
    });

    return NextResponse.json({ received: true });
  }

  if (HANDLED_EVENTS.has(parsed.data.meta.event_name)) {
    await billingService.syncSubscriptionFromWebhook(parsed.data);

    // The real conversion moment — not subscription_updated, which
    // also fires on every renewal and would inflate the funnel count.
    const userId = parsed.data.meta.custom_data?.user_id;

    if (
      parsed.data.meta.event_name === "subscription_created" &&
      userId
    ) {
      await analyticsService.record(
        userId,
        ANALYTICS_EVENTS.PREMIUM_ACTIVATED
      );
    }
  }

  return NextResponse.json({ received: true });
});
