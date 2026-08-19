import type { ProviderEvent } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

import type { Helldivers2AssignmentsResponse } from "./types";

const OBJECTIVE_MAX_LENGTH = 60;

// The API's own `title` is a generic category label, not a name —
// it's literally "MAJOR ORDER"/"STRATEGIC THREAT" (all caps) for
// every assignment of that kind, so using it verbatim gave every
// order the same title. Confirmed against the live API 2026-08-19,
// and visible in production as 5 separate rows all reading
// "MAJOR ORDER". Title-cased, since shouting in a list/notification
// subject is the API's formatting choice, not information.
function formatKind(title: string | null): string {
  if (!title) {
    return "Major Order";
  }

  return title
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// The real distinguishing content lives in the briefing ("Liberate
// Seasse to protect the Ministry of Science..."). Takes its opening
// clause so the title says what the order actually is, cutting on a
// word boundary rather than mid-word.
function summarizeObjective(briefing: string | null): string | null {
  if (!briefing) {
    return null;
  }

  const firstSentence = briefing.split(/(?<=\.)\s/)[0].replace(/\.$/, "");

  if (firstSentence.length <= OBJECTIVE_MAX_LENGTH) {
    return firstSentence;
  }

  const cut = firstSentence.slice(0, OBJECTIVE_MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
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
    .map((assignment) => {
      const kind = formatKind(assignment.title);
      const objective = summarizeObjective(assignment.briefing);

      return {
        id: `helldivers2-assignment-${assignment.id}`,
        gameId: GAME_IDS.HELLDIVERS_2,
        title: objective ? `${kind}: ${objective}` : kind,
        description:
          assignment.briefing ||
          `${kind} — an active Helldivers 2 community objective.`,
        status: "LIVE" as const,
        category: EVENT_CATEGORIES.PLAYABLE,
        isLimitedTime: true,
        trackedUsers: 0,
        checkedAt: now,
      };
    });
}
