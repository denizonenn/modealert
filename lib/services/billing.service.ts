import {
  getUserPlan,
  getUserBilling,
  setUserSubscriptionByUserId,
  setUserSubscriptionBySubscriptionId,
} from "@/lib/repositories/user.repository";
import {
  buildCheckoutUrl,
  cancelSubscription,
  getCustomerPortalUrl,
} from "@/lib/billing/lemonsqueezy-client";
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  BILLING_INTERVALS,
  PLANS,
  SUBSCRIPTION_STATUS_LIFETIME,
  type BillingInterval,
  type Plan,
} from "@/lib/constants/plan";
import type { z } from "zod";
import type { lemonSqueezyWebhookSchema } from "@/lib/validation/schemas";

type LemonSqueezyWebhookPayload = z.infer<
  typeof lemonSqueezyWebhookSchema
>;

// Lemon Squeezy's order status vocabulary — distinct from a
// subscription's. "paid" is the only status that should ever grant
// access; a refund/void on a lifetime purchase revokes it.
const PAID_ORDER_STATUSES = new Set(["paid"]);

export const billingService = {
  async getPlan(
    userId: string | undefined | null
  ): Promise<Plan> {
    if (!userId) {
      return PLANS.FREE;
    }

    return getUserPlan(userId);
  },

  async getBillingInfo(userId: string) {
    const billing = await getUserBilling(userId);

    if (!billing) {
      return null;
    }

    const manageUrl = billing.lemonSqueezySubscriptionId
      ? await getCustomerPortalUrl(
          billing.lemonSqueezySubscriptionId
        )
      : null;

    return { ...billing, manageUrl };
  },

  getCheckoutUrl(
    userId: string,
    email: string,
    interval: BillingInterval = BILLING_INTERVALS.MONTHLY
  ) {
    return buildCheckoutUrl(userId, email, interval);
  },

  // Best-effort — called right before account deletion so a Premium
  // user doesn't keep getting billed for an account that no longer
  // exists. Never throws: deletion should proceed either way.
  async cancelSubscriptionForUser(userId: string) {
    const billing = await getUserBilling(userId);

    if (!billing?.lemonSqueezySubscriptionId) {
      return;
    }

    await cancelSubscription(billing.lemonSqueezySubscriptionId);
  },

  // Called by the webhook route after signature verification. Maps a
  // Lemon Squeezy subscription event onto our own plan/status fields —
  // see docs/06_DECISIONS.md ADR-041 for the status → plan mapping.
  async syncSubscriptionFromWebhook(
    payload: LemonSqueezyWebhookPayload
  ) {
    const { attributes } = payload.data;
    const subscriptionId = payload.data.id;
    const userId = payload.meta.custom_data?.user_id;

    const plan: Plan = ACTIVE_SUBSCRIPTION_STATUSES.has(
      attributes.status
    )
      ? PLANS.PREMIUM
      : PLANS.FREE;

    const subscriptionRenewsAt = attributes.renews_at
      ? new Date(attributes.renews_at)
      : null;

    if (userId) {
      await setUserSubscriptionByUserId(userId, {
        plan,
        lemonSqueezyCustomerId: String(
          attributes.customer_id
        ),
        lemonSqueezySubscriptionId: subscriptionId,
        subscriptionStatus: attributes.status,
        subscriptionRenewsAt,
      });
      return;
    }

    // Fallback for events without custom_data (checkout always sets
    // it, but e.g. a subscription created directly in the Lemon
    // Squeezy dashboard wouldn't have it) — match by subscription id
    // instead, which only works for events after the first one.
    await setUserSubscriptionBySubscriptionId(subscriptionId, {
      plan,
      lemonSqueezyCustomerId: String(attributes.customer_id),
      subscriptionStatus: attributes.status,
      subscriptionRenewsAt,
    });
  },

  // Called by the webhook route for order_created/order_refunded — a
  // one-time lifetime purchase, not a subscription. No renewal, no
  // subscription id to store or later cancel (setting it null is
  // deliberate — see SubscriptionUpdate). Requires custom_data.user_id
  // (always present on checkouts built by buildCheckoutUrl, since we
  // control that URL); an order created directly in the Lemon Squeezy
  // dashboard without it can't be matched to a ModeAlert account and
  // is logged, not silently dropped.
  async syncOrderFromWebhook(
    payload: LemonSqueezyWebhookPayload
  ): Promise<{ matched: boolean }> {
    const { attributes } = payload.data;
    const userId = payload.meta.custom_data?.user_id;

    if (!userId) {
      return { matched: false };
    }

    const plan: Plan = PAID_ORDER_STATUSES.has(attributes.status)
      ? PLANS.PREMIUM
      : PLANS.FREE;

    await setUserSubscriptionByUserId(userId, {
      plan,
      lemonSqueezyCustomerId: String(attributes.customer_id),
      lemonSqueezySubscriptionId: null,
      subscriptionStatus:
        plan === PLANS.PREMIUM
          ? SUBSCRIPTION_STATUS_LIFETIME
          : attributes.status,
      subscriptionRenewsAt: null,
    });

    return { matched: true };
  },
};
