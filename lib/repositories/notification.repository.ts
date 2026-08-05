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