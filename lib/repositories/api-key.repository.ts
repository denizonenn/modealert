import { prisma } from "@/lib/db/prisma";

export async function createApiKey(
  userId: string,
  name: string,
  keyHash: string,
  keyPrefix: string
) {
  return prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      keyPrefix,
    },
  });
}

export async function getApiKeyByHash(keyHash: string) {
  return prisma.apiKey.findUnique({
    where: { keyHash },
  });
}

export async function getAllApiKeys() {
  return prisma.apiKey.findMany({
    include: {
      user: {
        select: { email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApiKeysByUser(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function touchApiKeyLastUsed(id: string) {
  return prisma.apiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}

export async function revokeApiKey(id: string) {
  return prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}
