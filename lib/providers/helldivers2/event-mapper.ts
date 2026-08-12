import type { ProviderEvent } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

import type { Helldivers2AssignmentsResponse } from "./types";

// Active Major Orders/Personal Orders only expose an `expiration` — no
// start timestamp — so an assignment still present in the response is
// LIVE by definition; once it expires it simply drops out of the next
// response and eventSyncService's stale-event pass marks it ENDED.
export function mapAssignments(
  assignments: Helldivers2AssignmentsResponse
): ProviderEvent[] {
  const now = new Date();

  return assignments
    .filter((assignment) => new Date(assignment.expiration) > now)
    .map((assignment) => ({
      id: `helldivers2-assignment-${assignment.id}`,
      gameId: GAME_IDS.HELLDIVERS_2,
      title: assignment.title ?? "Major Order",
      description: assignment.briefing || undefined,
      status: "LIVE" as const,
      category: EVENT_CATEGORIES.PLAYABLE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    }));
}
