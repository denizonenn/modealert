import {
  EventName,
  type AdjustmentCreatedEvent,
  type EventEntity,
  type SubscriptionCreatedEvent,
  type TransactionCompletedEvent,
} from "@paddle/paddle-node-sdk";

import { analyticsService } from "@/lib/services/analytics.service";
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events";
import {
  getUserPlan,
  getUserBilling,
  setUserSubscriptionByUserId,
  setUserSubscriptionBySubscriptionId,
} from "@/lib/repositories/user.repository";
import {
  cancelSubscription,
  getClientCheckoutSettings,
  getCustomerPortalUrl,
  getTransaction,
  getWebhookIpCidrs,
  isCheckoutConfigured,
  priceIdFor,
} from "@/lib/billing/paddle-client";
import {
  BILLING_INTERVALS,
  PLANS,
  SUBSCRIPTION_STATUS_LIFETIME,
  SUBSCRIPTION_STATUS_REFUNDED,
  type BillingInterval,
  type Plan,
} from "@/lib/constants/plan";
import {
  isAllowedWebhookIp,
  isLifetimePurchase,
  planForSubscriptionStatus,
  shouldRevokeLifetime,
} from "@/lib/services/billing-rules";
import { paddleCustomDataSchema } from "@/lib/validation/schemas";

// Every subscription.* event carries the same subscription shape, and
// both adjustment.created/updated the same adjustment shape.
type PaddleSubscription = SubscriptionCreatedEvent["data"];
type PaddleTransaction = TransactionCompletedEvent["data"];
type PaddleAdjustment = AdjustmentCreatedEvent["data"];

// Which ModeAlert user a Paddle resource belongs to — set by our
// checkout as custom_data.user_id and copied by Paddle onto the
// transaction and subscription it creates.
function userIdFrom(customData: unknown): string | null {
  return paddleCustomDataSchema.parse(customData)?.user_id ?? null;
}

const SUBSCRIPTION_EVENTS = new Set<string>([
  EventName.SubscriptionCreated,
  EventName.SubscriptionUpdated,
  EventName.SubscriptionActivated,
  EventName.SubscriptionCanceled,
  EventName.SubscriptionPastDue,
  EventName.SubscriptionPaused,
  EventName.SubscriptionResumed,
  EventName.SubscriptionTrialing,
]);

// Tracked by comparing the real plan before/after a write, not by
// event name — Paddle redelivers on retry, and counting by event name
// would double-count a conversion or cancellation every time.
// Comparing state transitions is naturally idempotent: re-processing
// the same event sees the same plan before and after, so nothing fires.
async function recordPlanTransition(
  userId: string,
  planBefore: Plan
) {
  const planAfter = await getUserPlan(userId);

  if (planBefore === PLANS.FREE && planAfter === PLANS.PREMIUM) {
    await analyticsService.record(userId, ANALYTICS_EVENTS.PREMIUM_ACTIVATED);
  }

  if (planBefore === PLANS.PREMIUM && planAfter === PLANS.FREE) {
    await analyticsService.record(userId, ANALYTICS_EVENTS.PREMIUM_CANCELLED);
  }
}

export type CheckoutOptions = NonNullable<
  ReturnType<typeof billingService.getCheckoutOptions>
>;

export const billingService = {
  async getPlan(
    userId: string | undefined | null
  ): Promise<Plan> {
    if (!userId) {
      return PLANS.FREE;
    }

    return getUserPlan(userId);
  },

  // Plain DB read — no Paddle call. `canManage` says whether the
  // "Manage subscription" link should show; the portal session itself
  // is only minted when the link is clicked (getPortalUrl below).
  async getBillingInfo(userId: string) {
    const billing = await getUserBilling(userId);

    if (!billing) {
      return null;
    }

    return { ...billing, canManage: billing.billingCustomerId !== null };
  },

  // The Paddle customer id always comes from the signed-in user's own
  // row — never from the client — so one user can't open another's
  // portal. Sessions are short-lived, hence minted per click.
  async getPortalUrl(userId: string): Promise<string | null> {
    const billing = await getUserBilling(userId);

    if (!billing?.billingCustomerId) {
      return null;
    }

    return getCustomerPortalUrl(
      billing.billingCustomerId,
      billing.billingSubscriptionId
    );
  },

  // Everything the pricing page's client component needs to open
  // Paddle's overlay checkout. null when checkout isn't configured at
  // all — the page then shows "Upgrades aren't live yet". A single
  // interval without a price id comes back as null and stays hidden.
  getCheckoutOptions(userId: string, email: string) {
    if (!isCheckoutConfigured(BILLING_INTERVALS.MONTHLY)) {
      return null;
    }

    const intervals = Object.values(BILLING_INTERVALS);

    const priceIds = Object.fromEntries(
      intervals.map((interval) => [
        interval,
        isCheckoutConfigured(interval) ? priceIdFor(interval) : null,
      ])
    ) as Record<BillingInterval, string | null>;

    return {
      ...getClientCheckoutSettings(),
      userId,
      email,
      priceIds,
    };
  },

  // Best-effort — called right before account deletion so a Premium
  // user doesn't keep getting billed for an account that no longer
  // exists. Never throws: deletion should proceed either way.
  async cancelSubscriptionForUser(userId: string) {
    const billing = await getUserBilling(userId);

    if (!billing?.billingSubscriptionId) {
      return;
    }

    await cancelSubscription(billing.billingSubscriptionId);
  },

  // Webhooks are only accepted from Paddle's published addresses. The
  // signature check is the real protection; this is defense in depth.
  // Skipped outside production builds, where requests come from
  // localhost or a dev tunnel, not from Paddle's IPs directly.
  async isTrustedWebhookSource(ip: string | null): Promise<boolean> {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }

    return isAllowedWebhookIp(ip, await getWebhookIpCidrs());
  },

  // Entry point for the webhook route, called with an already
  // signature-verified event. Throws on a DB/API failure so the route
  // can answer non-2xx and Paddle retries.
  async handleWebhookEvent(event: EventEntity) {
    if (SUBSCRIPTION_EVENTS.has(event.eventType)) {
      await this.syncSubscription(event.data as PaddleSubscription);
      return;
    }

    switch (event.eventType) {
      case EventName.TransactionCompleted:
        await this.syncLifetimePurchase(event.data);
        return;
      case EventName.AdjustmentCreated:
      case EventName.AdjustmentUpdated:
        await this.revokeLifetimeOnRefund(event.data);
        return;
      default:
        // Includes customer.created/updated: a Paddle customer is
        // already tied to the ModeAlert user through the subscription/
        // transaction events above (billingCustomerId), and the email
        // lives on our own User row, so there's nothing extra to mirror.
        // Anything else we're subscribed to is acked without action.
        return;
    }
  },

  // subscription.created / updated / activated / canceled / past_due /
  // paused / resumed / trialing. Every event carries the full current
  // subscription, so this just writes the latest state — idempotent
  // under Paddle's at-least-once, unordered delivery.
  async syncSubscription(subscription: PaddleSubscription) {
    const userId = userIdFrom(subscription.customData);
    const plan = planForSubscriptionStatus(subscription.status);

    const subscriptionRenewsAt = subscription.nextBilledAt
      ? new Date(subscription.nextBilledAt)
      : null;

    if (userId) {
      const current = await getUserBilling(userId);

      // A lifetime owner who also once had a subscription must not
      // lose Premium when that old subscription ends.
      if (
        !current ||
        (plan === PLANS.FREE &&
          current.subscriptionStatus === SUBSCRIPTION_STATUS_LIFETIME)
      ) {
        return;
      }

      await setUserSubscriptionByUserId(userId, {
        plan,
        billingCustomerId: subscription.customerId,
        billingSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionRenewsAt,
      });

      await recordPlanTransition(userId, current.plan as Plan);
      return;
    }

    // Fallback for a subscription without custom_data (our checkout
    // always sets it, but one created in the Paddle dashboard wouldn't)
    // — match by subscription id, which only works once it's stored.
    await setUserSubscriptionBySubscriptionId(subscription.id, {
      plan,
      billingCustomerId: subscription.customerId,
      subscriptionStatus: subscription.status,
      subscriptionRenewsAt,
    });
  },

  // transaction.completed — only acts on a one-time lifetime purchase.
  // Subscription payments also complete transactions, but their access
  // is driven by the subscription.* events above, so they're skipped.
  async syncLifetimePurchase(transaction: PaddleTransaction) {
    const userId = userIdFrom(transaction.customData);

    if (
      !isLifetimePurchase(transaction, priceIdFor(BILLING_INTERVALS.LIFETIME)) ||
      !userId ||
      !transaction.customerId
    ) {
      return;
    }

    const planBefore = await getUserPlan(userId);

    await setUserSubscriptionByUserId(userId, {
      plan: PLANS.PREMIUM,
      billingCustomerId: transaction.customerId,
      billingSubscriptionId: null,
      subscriptionStatus: SUBSCRIPTION_STATUS_LIFETIME,
      subscriptionRenewsAt: null,
    });

    await recordPlanTransition(userId, planBefore);
  },

  // adjustment.created / updated — revokes a lifetime purchase once a
  // full refund or chargeback is approved. The adjustment doesn't carry
  // our custom_data or the price, so the original transaction is
  // fetched (a single, fast API call — fine inside the 5s budget).
  async revokeLifetimeOnRefund(adjustment: PaddleAdjustment) {
    if (!shouldRevokeLifetime(adjustment)) {
      return;
    }

    const transaction = await getTransaction(adjustment.transactionId);
    const userId = userIdFrom(transaction.customData);

    if (
      !isLifetimePurchase(transaction, priceIdFor(BILLING_INTERVALS.LIFETIME)) ||
      !userId
    ) {
      return;
    }

    const current = await getUserBilling(userId);

    // Only a user still holding that lifetime purchase is downgraded —
    // not one who has since moved to a paid subscription.
    if (current?.subscriptionStatus !== SUBSCRIPTION_STATUS_LIFETIME) {
      return;
    }

    await setUserSubscriptionByUserId(userId, {
      plan: PLANS.FREE,
      billingCustomerId: adjustment.customerId,
      billingSubscriptionId: null,
      subscriptionStatus: SUBSCRIPTION_STATUS_REFUNDED,
      subscriptionRenewsAt: null,
    });

    await recordPlanTransition(userId, current.plan as Plan);
  },
};
