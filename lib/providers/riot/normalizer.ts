import type { ProviderEvent } from "@/lib/providers/core/provider";

import type {
  RiotEventResponse,
} from "./types";

const STATUS_MAP: Record<
  string,
  ProviderEvent["status"]
> = {
  LIVE: "LIVE",
  UPCOMING: "UPCOMING",
  TRACKING: "TRACKING",
  ENDED: "ENDED",
};

export function normalizeRiotEvent(
  event: RiotEventResponse
): ProviderEvent {
  return {
    id: event.id,
    gameId: event.gameId,
    title: event.title,

    status:
      STATUS_MAP[event.status] ??
      "UPCOMING",

    trackedUsers:
      event.trackedUsers,

    checkedAt: new Date(
      event.checkedAt
    ),
  };
}

export function normalizeRiotEvents(
  events: RiotEventResponse[]
): ProviderEvent[] {
  return events.map(
    normalizeRiotEvent
  );
}