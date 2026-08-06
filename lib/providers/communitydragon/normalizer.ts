import type {
  ProviderEvent,
  ProviderEventStatus,
} from "@/lib/providers/core/provider";

import type {
  CommunityDragonDisplayEvent,
  CommunityDragonEventHubEntry,
  CommunityDragonEventHubResponse,
} from "./types";

import { GAME_IDS } from "@/lib/constants/games";

// The event-hub feed has no free-text description field — only image
// URLs and this type code — so descriptions are built from a small,
// fixed lookup rather than invented per event.
const EVENT_HUB_TYPE_LABELS: Record<string, string> = {
  kSeasonPass: "Season pass — earn track rewards through featured missions.",
  kActivityCenterMilestones:
    "Limited-time milestone event with special rewards.",
  kHallOfLegends: "Hall of Legends celebration event.",
  kDemaciaPass: "Classic-mode battle pass.",
};

function describeEvent(
  event: CommunityDragonEventHubEntry["event"]
): string {
  const base =
    EVENT_HUB_TYPE_LABELS[event.eventHubType] ??
    "League of Legends event.";

  return event.localizedEventSubtitle
    ? `${event.localizedEventSubtitle} — ${base}`
    : base;
}

function computeStatus(
  startDate: string,
  endDate: string,
  now: Date
): ProviderEventStatus {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return "UPCOMING";
  }

  if (now > end) {
    return "ENDED";
  }

  return "LIVE";
}

function toProviderEvent(
  entry: CommunityDragonEventHubEntry,
  now: Date
): ProviderEvent {
  const { event } = entry;

  return {
    id: `communitydragon-event-${event.eventId}`,

    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

    title:
      event.localizedShortName ||
      event.localizedName,

    description: describeEvent(event),

    status: computeStatus(
      event.startDate,
      event.endDate,
      now
    ),

    trackedUsers: 0,

    checkedAt: now,
  };
}

export function normalizeEventHub(
  response: CommunityDragonEventHubResponse,
  now: Date = new Date()
): ProviderEvent[] {
  return response.map((entry) =>
    toProviderEvent(entry, now)
  );
}

// Content that appears on the PBE patchline but not (yet) on live —
// the earliest practical signal ModeAlert has for an upcoming event,
// per docs/06_DECISIONS.md ADR-001. Marked as a preview rather than a
// confirmed event because PBE content sometimes gets pulled before it
// ever ships live.
export function mapPbeCandidates(
  pbeResponse: CommunityDragonEventHubResponse,
  liveResponse: CommunityDragonEventHubResponse,
  now: Date = new Date()
): ProviderEvent[] {
  const liveIds = new Set(
    liveResponse.map((entry) => entry.event.eventId)
  );

  return pbeResponse
    .filter((entry) => !liveIds.has(entry.event.eventId))
    .map((entry) => {
      const event = toProviderEvent(entry, now);

      return {
        ...event,
        id: `communitydragon-pbe-${entry.event.eventId}`,
        title: `${event.title} (PBE Preview)`,
        description: `Spotted on Riot's PBE (test server), not live yet — may still change or be pulled before shipping. ${event.description}`,
      };
    });
}

export function toDisplayEvents(
  response: CommunityDragonEventHubResponse,
  now: Date = new Date()
): CommunityDragonDisplayEvent[] {
  return response
    .map(({ event }) => ({
      id: event.eventId,

      title:
        event.localizedShortName ||
        event.localizedName,

      status: computeStatus(
        event.startDate,
        event.endDate,
        now
      ),

      startDate: event.startDate,

      endDate: event.endDate,

      hubType: event.eventHubType,
    }))
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() -
        new Date(b.startDate).getTime()
    );
}
