import { NextRequest, NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/billing/lemonsqueezy-client";
import { billingService } from "@/lib/services/billing.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { lemonSqueezyWebhookSchema } from "@/lib/validation/schemas";
import { analyticsService } from "@/lib/services/analytics.service";
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events";
import { PLANS } from "@/lib/constants/plan";
import { logger } from "@/lib/logger/logger";

const HANDLED_SUBSCRIPTION_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
]);

// One-time lifetime purchases — a different Lemon Squeezy object
// (order, not subscription), see billingService.syncOrderFromWebhook.
const HANDLED_ORDER_EVENTS = new Set([
  "order_created",
  "order_refunded",
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

  const eventName = parsed.data.meta.event_name;
  const isSubscriptionEvent = HANDLED_SUBSCRIPTION_EVENTS.has(eventName);
  const isOrderEvent = HANDLED_ORDER_EVENTS.has(eventName);

  if (isSubscriptionEvent || isOrderEvent) {
    const userId = parsed.data.meta.custom_data?.user_id;

    // Tracked by comparing the real plan before/after the sync, not
    // by matching on event_name — webhook providers redeliver on
    // retry (a timeout on our end doesn't mean Lemon Squeezy won't
    // resend the identical event), and matching on event_name alone
    // would double-count a conversion or cancellation on every retry,
    // inflating exactly the funnel/churn numbers this tracking exists
    // to keep honest. Comparing real state transitions is naturally
    // idempotent: re-processing the same event twice sees the same
    // "before" and "after" plan the second time, so nothing fires.
    // Also catches subscription_expired/paused as real churn, which
    // matching only on "subscription_cancelled" missed entirely.
    const planBefore = userId
      ? await billingService.getPlan(userId)
      : null;

    if (isSubscriptionEvent) {
      await billingService.syncSubscriptionFromWebhook(parsed.data);
    } else {
      await billingService.syncOrderFromWebhook(parsed.data);
    }

    if (userId) {
      const planAfter = await billingService.getPlan(userId);

      if (
        planBefore === PLANS.FREE &&
        planAfter === PLANS.PREMIUM
      ) {
        await analyticsService.record(
          userId,
          ANALYTICS_EVENTS.PREMIUM_ACTIVATED
        );
      }

      if (
        planBefore === PLANS.PREMIUM &&
        planAfter === PLANS.FREE
      ) {
        await analyticsService.record(
          userId,
          ANALYTICS_EVENTS.PREMIUM_CANCELLED
        );
      }
    }
  }

  return NextResponse.json({ received: true });
});
