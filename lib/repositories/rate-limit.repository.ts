import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

// Count-then-insert as two separate statements would race under real
// concurrent requests for the same key: several requests could all
// read the same pre-insert count and all pass the limit check,
// letting a burst of concurrent requests through a limit meant to
// stop exactly that — so the limit comparison has to happen inside
// the same lock as the count, not in the caller. pg_advisory_xact_lock
// serializes concurrent callers that share a key (different keys
// never block each other) and auto-releases when the transaction
// ends — no separate unlock call, no risk of a held lock outliving a
// crashed request. A blocked attempt is deliberately NOT recorded
// (matches the old behavior) — recording it would let a sustained
// flood keep growing the table forever even after every attempt is
// already being rejected.
export async function checkAndRecordHit(
  key: string,
  since: Date,
  limit: number
): Promise<boolean> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw(
        Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${key}))`
      );

      const count = await tx.rateLimitHit.count({
        where: {
          key,
          createdAt: { gte: since },
        },
      });

      if (count >= limit) {
        return false;
      }

      await tx.rateLimitHit.create({ data: { key } });

      return true;
    },
    // A real burst against one key (the exact scenario this exists
    // to survive) queues up waiting for the same advisory lock —
    // Prisma's 2s default maxWait was tight enough to throw under a
    // genuinely heavy concurrent test (20 truly-simultaneous calls).
    // Widened so a real attack degrades to "queued, still enforced"
    // rather than "the rate limit check itself errors out."
    { maxWait: 10_000, timeout: 10_000 }
  );
}
