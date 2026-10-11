import type { ProviderEvent } from "@/lib/providers/core/provider";

import { env } from "@/lib/config/env";
import { gameName } from "@/lib/constants/games";
import { logger } from "@/lib/logger/logger";
import { checkAndRecordHit } from "@/lib/repositories/rate-limit.repository";

import {
  buildBroadcastText,
  shouldBroadcast,
} from "@/lib/notifications/x/broadcast-text";
import { createPost } from "@/lib/notifications/x/x.client";

const DAY_MS = 24 * 60 * 60 * 1000;

// Rolling 24h cap (Deniz's call, 2026-10-11) — the daily cron can flip
// several modes at once; this keeps the account from flooding and the
// pay-per-use bill bounded. Persisted in RateLimitHit (not in memory)
// so it holds across serverless instances and manual admin syncs.
const MAX_POSTS_PER_DAY = 5;
const DAILY_KEY = "x-broadcast:daily";

// Same event can't be posted twice within this window — guards against
// a provider flapping LIVE→ENDED→LIVE across syncs, while still letting
// a weekly mode (e.g. Trials of Osiris) be announced again next week.
const PER_EVENT_WINDOW_MS = 2 * DAY_MS;

function credentials() {
  return {
    consumerKey: env.X_API_KEY,
    consumerSecret: env.X_API_SECRET,
    accessToken: env.X_ACCESS_TOKEN,
    accessTokenSecret: env.X_ACCESS_TOKEN_SECRET,
  };
}

// Off unless explicitly switched on AND every key is set — the same
// dormant-until-configured pattern as ADS_ENABLED. Posting costs real
// money, so a half-configured deploy must stay silent, not half-work.
export function isXBroadcastEnabled(): boolean {
  const creds = credentials();

  return (
    env.X_BROADCAST_ENABLED &&
    Object.values(creds).every((value) => value.length > 0)
  );
}

export const socialBroadcastService = {
  // Never throws: a public announcement is a side channel — an X outage
  // or exhausted credits must not break the sync or the per-user
  // email/Discord alerts that run right next to it.
  async maybeBroadcast(
    event: ProviderEvent,
    previous: { status: string } | null
  ): Promise<void> {
    if (!isXBroadcastEnabled() || !shouldBroadcast(event, previous)) {
      return;
    }

    try {
      const now = Date.now();

      // Per-event check first: burning a dedupe slot is free, burning
      // one of the 5 daily slots on a duplicate is not.
      const firstTimeRecently = await checkAndRecordHit(
        `x-broadcast:event:${event.id}`,
        new Date(now - PER_EVENT_WINDOW_MS),
        1
      );

      if (!firstTimeRecently) {
        return;
      }

      const underDailyCap = await checkAndRecordHit(
        DAILY_KEY,
        new Date(now - DAY_MS),
        MAX_POSTS_PER_DAY
      );

      if (!underDailyCap) {
        logger.info("X broadcast skipped: daily cap reached", {
          eventId: event.id,
        });

        return;
      }

      const postId = await createPost(
        buildBroadcastText(event.title, gameName(event.gameId)),
        credentials()
      );

      logger.info("Posted event to X", { eventId: event.id, postId });
    } catch (error) {
      logger.error("X broadcast failed", {
        eventId: event.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
