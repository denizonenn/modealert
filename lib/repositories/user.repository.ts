import { prisma } from "@/lib/db/prisma";
import { PLANS, type Plan } from "@/lib/constants/plan";

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
      lemonSqueezyCustomerId: true,
      lemonSqueezySubscriptionId: true,
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
      watchlists: {
        select: {
          event: {
            select: {
              title: true,
              status: true,
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
    where: { lemonSqueezySubscriptionId: subscriptionId },
    select: { id: true },
  });
}

interface SubscriptionUpdate {
  plan: Plan;
  lemonSqueezyCustomerId: string;
  lemonSqueezySubscriptionId: string;
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
  data: Omit<SubscriptionUpdate, "lemonSqueezySubscriptionId">
) {
  return prisma.user.updateMany({
    where: { lemonSqueezySubscriptionId: subscriptionId },
    data,
  });
}
