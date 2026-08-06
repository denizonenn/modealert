import type { ProviderEvent } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";

import type { Helldivers2AssignmentsResponse } from "./types";

const BRIEFING_MAX_LENGTH = 100;

function buildTitle(
  label: string | null,
  briefing: string | null
): string {
  if (!briefing) {
    return label ?? "Major Order";
  }

  const trimmed =
    briefing.length > BRIEFING_MAX_LENGTH
      ? `${briefing.slice(0, BRIEFING_MAX_LENGTH).trimEnd()}…`
      : briefing;

  return label ? `${label}: ${trimmed}` : trimmed;
}

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
      title: buildTitle(assignment.title, assignment.briefing),
      status: "LIVE" as const,
      trackedUsers: 0,
      checkedAt: now,
    }));
}
