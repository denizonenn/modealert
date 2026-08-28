import {
  createAnonymousFunnelEvent,
  getAnonymousFunnelCounts,
} from "@/lib/repositories/anonymous-funnel.repository";
import type { AnonymousFunnelEventName } from "@/lib/constants/anonymous-funnel-events";
import { logger } from "@/lib/logger/logger";

export const anonymousFunnelService = {
  async record(name: AnonymousFunnelEventName) {
    // Best-effort, same as the signed-in analytics service — a broken
    // funnel metric should never surface as a visible error to a
    // visitor who hasn't even signed up yet.
    try {
      await createAnonymousFunnelEvent(name);
    } catch (error) {
      logger.error("Failed to record anonymous funnel event", {
        name,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  },

  async getFunnelCounts(windowDays: number) {
    const since = new Date(
      Date.now() - windowDays * 24 * 60 * 60 * 1000
    );

    return getAnonymousFunnelCounts(since);
  },
};
