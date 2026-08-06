import { prisma } from "@/lib/db/prisma";

export async function createNotificationFailure(data: {
  userId: string;
  eventId: string;
  channel: string;
  error: string;
}) {
  return prisma.notificationFailure.create({
    data,
  });
}

export async function getNotificationFailureCount(
  since: Date
) {
  return prisma.notificationFailure.count({
    where: {
      createdAt: {
        gte: since,
      },
    },
  });
}
