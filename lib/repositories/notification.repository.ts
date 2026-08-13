import { prisma } from "@/lib/db/prisma";

export async function getNotificationsByUser(
  userId: string
) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getNotificationStats() {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  const [total, last30Days] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
  ]);

  return { total, last30Days };
}

export async function getFalsePositiveStats() {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  const [totalReported, reportedLast30Days] =
    await Promise.all([
      prisma.notification.count({
        where: {
          falsePositiveReportedAt: {
            not: null,
          },
        },
      }),
      prisma.notification.count({
        where: {
          falsePositiveReportedAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

  return { totalReported, reportedLast30Days };
}

export async function createNotification(data: {
  userId: string;
  eventId: string;
  title: string;
  message: string;
  channel: string;
}) {
  return prisma.notification.create({
    data: {
      ...data,
      read: false,
    },
  });
}

export async function markNotificationRead(
  id: string,
  userId: string
) {
  return prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      read: true,
    },
  });
}

export async function markAllNotificationsRead(
  userId: string
) {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

// Idempotent — only sets the timestamp the first time, so a repeat
// call (e.g. a double-click) doesn't overwrite the original report
// time.
export async function reportNotificationFalsePositive(
  id: string,
  userId: string
) {
  return prisma.notification.updateMany({
    where: {
      id,
      userId,
      falsePositiveReportedAt: null,
    },
    data: {
      falsePositiveReportedAt: new Date(),
    },
  });
}

export async function deleteNotification(
  id: string,
  userId: string
) {
  return prisma.notification.deleteMany({
    where: {
      id,
      userId,
    },
  });
}