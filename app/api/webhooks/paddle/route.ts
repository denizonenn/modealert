import { NextRequest, NextResponse } from "next/server";
import type { EventEntity } from "@paddle/paddle-node-sdk";

import {
  isWebhookConfigured,
  unmarshalWebhook,
} from "@/lib/billing/paddle-client";
import { billingService } from "@/lib/services/billing.service";
import { logger } from "@/lib/logger/logger";

// Paddle only treats a 2xx as delivered and retries everything else
// (sandbox: 3 tries / ~15 min, live: 60 tries / ~3 days), so every
// failure below — bad signature included — is a non-2xx. A forged
// request and a rotated-but-not-yet-redeployed secret look identical,
// and retrying recovers the second case on its own. The service's
// handlers write the latest state, so a retry or duplicate delivery is
// harmless. See docs/06_DECISIONS.md ADR-066.
export async function POST(request: NextRequest) {
  if (!isWebhookConfigured()) {
    return NextResponse.json(
      { error: "Webhooks not configured" },
      { status: 503 }
    );
  }

  // Signature is computed over the exact raw bytes Paddle sent — must
  // read as text before any JSON parsing.
  const signature = request.headers.get("paddle-signature") ?? "";
  const rawBody = await request.text();

  if (!signature || !rawBody) {
    return NextResponse.json(
      { error: "Missing signature or body" },
      { status: 400 }
    );
  }

  let event: EventEntity;

  try {
    event = await unmarshalWebhook(rawBody, signature);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  try {
    await billingService.handleWebhookEvent(event);
  } catch (error) {
    logger.error("Paddle webhook processing failed", {
      eventType: event.eventType,
      eventId: event.eventId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
