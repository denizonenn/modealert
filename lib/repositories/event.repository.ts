import { createHash } from "crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";

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

export async function getEventBySlug(
  slug: string
): Promise<EventWithGame | null> {
  return prisma.event.findUnique({
    where: {
      slug,
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

export async function getEventsBySource(
  source: string
): Promise<EventWithGame[]> {
  return prisma.event.findMany({
    where: {
      source,
    },

    include: {
      game: true,
    },
  });
}

export async function getEventCountsByGame(): Promise<
  Record<string, number>
> {
  const rows = await prisma.event.groupBy({
    by: ["gameId"],

    _count: {
      _all: true,
    },
  });

  return Object.fromEntries(
    rows.map((row) => [row.gameId, row._count._all])
  );
}

function buildEventSlug(
  event: ProviderEvent
): string {
  // Same game + same title can recur under different
  // provider ids (e.g. a season pass that ends and
  // restarts as a new event-hub entry) — the id hash
  // suffix keeps the globally-unique slug column collision-free
  // while staying stable across upserts of the same event.
  const idHash = createHash("sha1")
    .update(event.id)
    .digest("hex")
    .slice(0, 6);

  return `${slugify(
    `${event.gameId}-${event.title}`
  )}-${idHash}`;
}

export async function upsertEvent(
  event: ProviderEvent,
  source: string
) {
  const data = {
    gameId: event.gameId,

    source,

    title: event.title,

    description:
      event.description ?? null,

    slug: buildEventSlug(event),

    status: event.status,

    category: event.category,

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