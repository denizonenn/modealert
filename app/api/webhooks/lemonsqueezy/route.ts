import { NextRequest, NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/billing/lemonsqueezy-client";
import { billingService } from "@/lib/services/billing.service";

const HANDLED_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
]);

export async function POST(request: NextRequest) {
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

  const payload = JSON.parse(rawBody);
  const eventName = payload?.meta?.event_name;

  if (HANDLED_EVENTS.has(eventName)) {
    await billingService.syncSubscriptionFromWebhook(payload);
  }

  return NextResponse.json({ received: true });
}
