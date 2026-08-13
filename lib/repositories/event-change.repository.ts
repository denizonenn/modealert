import { prisma } from "@/lib/db/prisma";

export interface CreateEventChangeInput {
  eventId: string;

  field: string;

  oldValue: string | null;

  newValue: string | null;
}

export async function createEventChange(
  input: CreateEventChangeInput
) {
  return prisma.eventChange.create({
    data: input,
  });
}

export async function getChangesByEvent(
  eventId: string
) {
  return prisma.eventChange.findMany({
    where: {
      eventId,
    },

    orderBy: {
      changedAt: "desc",
    },
  });
}
