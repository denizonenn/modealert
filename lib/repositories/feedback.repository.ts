import { prisma } from "@/lib/db/prisma";

export async function createFeedback(data: {
  userId: string;
  message: string;
}) {
  return prisma.feedback.create({ data });
}

export async function getRecentFeedback(limit: number) {
  return prisma.feedback.findMany({
    include: {
      user: {
        select: { email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
