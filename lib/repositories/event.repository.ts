import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

export type EventWithGame =
  Prisma.EventGetPayload<{
    include: {
      game: true;
    };
  }>;

export async function getEvents(): Promise<
  EventWithGame[]
> {
  return prisma.event.findMany({
    include: {
      game: true,
    },

    orderBy: {
      lastChecked: "desc",
    },
  });
}

export async function getLiveEvents(): Promise<
  EventWithGame[]
> {
  return prisma.event.findMany({
    where: {
      status: "LIVE",
    },

    include: {
      game: true,
    },

    orderBy: {
      lastChecked: "desc",
    },
  });
}

export async function getTrackingEvents(): Promise<
  EventWithGame[]
> {
  return prisma.event.findMany({
    where: {
      status: "TRACKING",
    },

    include: {
      game: true,
    },

    orderBy: {
      lastChecked: "desc",
    },
  });
}

export async function getEventById(
  id: string
): Promise<EventWithGame | null> {
  return prisma.event.findUnique({
    where: {
      id,
    },

    include: {
      game: true,
    },
  });
}

export async function getEventsByGame(
  gameId: string
): Promise<EventWithGame[]> {
  return prisma.event.findMany({
    where: {
      gameId,
    },

    include: {
      game: true,
    },

    orderBy: {
      lastChecked: "desc",
    },
  });
}

export async function upsertEvent(
  event: ProviderEvent
) {
  const data = {
    gameId: event.gameId,

    title: event.title,

    status: event.status,

    trackedUsers:
      event.trackedUsers,

    lastChecked:
      event.checkedAt.toISOString(),
  };

  return prisma.event.upsert({
    where: {
      id: event.id,
    },

    update: data,

    create: {
      id: event.id,

      ...data,
    },
  });
}