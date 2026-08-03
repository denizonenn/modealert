import { prisma } from "@/lib/db/prisma";

export async function createHistory(
  eventId: string,
  status: string,
  startedAt: Date
) {
  return prisma.eventHistory.create({
    data: {
      eventId,
      status,
      startedAt,
    },
  });
}

export async function closeHistory(
  id: string,
 endedAt: Date
) {
  return prisma.eventHistory.update({
    where: {
      id,
    },
    data: {
      endedAt,
    },
  });
}

export async function getLatestHistory(
  eventId: string
) {
  return prisma.eventHistory.findFirst({
    where: {
      eventId,
      endedAt: null,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}

export async function getHistoryByEvent(
  eventId: string
) {
  return prisma.eventHistory.findMany({
    where: {
      eventId,
    },
    orderBy: {
      startedAt: "asc",
    },
  });
}

export async function getAllHistory() {
  return prisma.eventHistory.findMany({
    include: {
      event: true,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}