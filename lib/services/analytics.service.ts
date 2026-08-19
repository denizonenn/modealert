import {
  createAnalyticsEvent,
  getEventCounts,
} from "@/lib/repositories/analytics.repository";
import type { AnalyticsEventName } from "@/lib/constants/analytics-events";
import { logger } from "@/lib/logger/logger";

export const analyticsService = {
  async record(
    userId: string,
    name: AnalyticsEventName,
    detail?: string
  ) {
    // Best-effort — a broken funnel metric should never break the
    // real user action it's attached to (onboarding, checkout, etc).
    try {
      await createAnalyticsEvent({ userId, name, detail });
    } catch (error) {
      logger.error("Failed to record analytics event", {
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

    return getEventCounts(since);
  },
};
