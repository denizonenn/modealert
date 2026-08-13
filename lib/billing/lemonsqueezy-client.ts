import { createHmac, timingSafeEqual } from "crypto";

import { env } from "@/lib/config/env";
import { http } from "@/lib/http/client";
import { SITE_URL } from "@/lib/constants/site";

// No key/store/variant configured yet — same "disabled until Deniz
// provides real credentials" pattern as Resend/Google OAuth (see
// docs/06_DECISIONS.md ADR-003/ADR-005). Checkout stays hidden, not
// broken.
export function isCheckoutConfigured(): boolean {
  return (
    env.LEMONSQUEEZY_STORE_SUBDOMAIN !== "" &&
    env.LEMONSQUEEZY_VARIANT_ID !== ""
  );
}

export function isWebhookConfigured(): boolean {
  return env.LEMONSQUEEZY_WEBHOOK_SECRET !== "";
}

export function isApiConfigured(): boolean {
  return env.LEMONSQUEEZY_API_KEY !== "";
}

// Hosted checkout — no server round trip needed, Lemon Squeezy's own
// page handles the payment. `custom[user_id]` comes back untouched in
// every webhook event for this subscription, which is how the webhook
// handler knows which ModeAlert user to credit.
export function buildCheckoutUrl(
  userId: string,
  email: string
): string | null {
  if (!isCheckoutConfigured()) {
    return null;
  }

  const url = new URL(
    `/buy/${env.LEMONSQUEEZY_VARIANT_ID}`,
    `https://${env.LEMONSQUEEZY_STORE_SUBDOMAIN}.lemonsqueezy.com`
  );

  url.searchParams.set("checkout[email]", email);
  url.searchParams.set("checkout[custom][user_id]", userId);
  url.searchParams.set(
    "checkout[redirect_url]",
    `${SITE_URL}/dashboard/settings?upgraded=1`
  );

  return url.toString();
}

// Lemon Squeezy signs the raw webhook body with HMAC-SHA256 using the
// webhook signing secret, sent as a hex digest in `X-Signature`. Must
// run against the raw request body, not the re-serialized JSON — a
// re-stringified object can byte-differ from what was actually signed.
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!isWebhookConfigured() || !signatureHeader) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    env.LEMONSQUEEZY_WEBHOOK_SECRET
  )
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signatureHeader);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

interface LemonSqueezySubscriptionResponse {
  data: {
    attributes: {
      urls: {
        customer_portal: string;
      };
    };
  };
}

// Used by the "Manage subscription" link in /dashboard/settings — the
// customer portal itself (cancel/update card/view invoices) is hosted
// entirely by Lemon Squeezy, ModeAlert just needs a fresh URL for it.
export async function getCustomerPortalUrl(
  subscriptionId: string
): Promise<string | null> {
  if (!isApiConfigured()) {
    return null;
  }

  try {
    const response =
      await http<LemonSqueezySubscriptionResponse>(
        `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
        {
          retries: 1,
          headers: {
            Accept: "application/vnd.api+json",
            Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
          },
        }
      );

    return response.data.attributes.urls.customer_portal;
  } catch {
    return null;
  }
}
