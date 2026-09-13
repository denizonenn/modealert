import { prisma } from "@/lib/db/prisma";
import { PLANS, type Plan } from "@/lib/constants/plan";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
}

export async function getUserPlan(
  userId: string
): Promise<Plan> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  return (user?.plan as Plan) ?? PLANS.FREE;
}

export async function getUserBilling(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      plan: true,
      billingCustomerId: true,
      billingSubscriptionId: true,
      subscriptionStatus: true,
      subscriptionRenewsAt: true,
    },
  });
}

// Only users who'd actually see something worth reading — opted into
// email and watching at least one event. Selects just the fields the
// digest needs, not full User/Event/Game rows.
export async function getDigestRecipients() {
  return prisma.user.findMany({
    where: {
      emailOptOut: false,
      watchlists: { some: {} },
    },
    select: {
      id: true,
      email: true,
      locale: true,
      watchlists: {
        select: {
          event: {
            select: {
              title: true,
              status: true,
              slug: true,
              game: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function findUserBySubscriptionId(
  subscriptionId: string
) {
  return prisma.user.findUnique({
    where: { billingSubscriptionId: subscriptionId },
    select: { id: true },
  });
}

interface SubscriptionUpdate {
  plan: Plan;
  billingCustomerId: string;
  // null for a one-time (lifetime) purchase — there's nothing to renew
  // or cancel.
  billingSubscriptionId: string | null;
  subscriptionStatus: string;
  subscriptionRenewsAt: Date | null;
}

export async function setUserSubscriptionByUserId(
  userId: string,
  data: SubscriptionUpdate
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function setUserSubscriptionBySubscriptionId(
  subscriptionId: string,
  data: Omit<SubscriptionUpdate, "billingSubscriptionId">
) {
  return prisma.user.updateMany({
    where: { billingSubscriptionId: subscriptionId },
    data,
  });
}
