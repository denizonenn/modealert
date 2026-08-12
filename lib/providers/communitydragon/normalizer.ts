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

import {
  EVENT_CATEGORIES,
  type EventCategory,
} from "@/lib/constants/event-category";

// The event-hub feed has no free-text description field — only image
// URLs and this type code — so descriptions are built from a small,
// fixed lookup rather than invented per event.
const EVENT_HUB_TYPE_LABELS: Record<string, string> = {
  kSeasonPass: "Season pass — earn track rewards through featured missions.",
  kActivityCenterMilestones:
    "Limited-time milestone event with special rewards.",
  kHallOfLegends: "Hall of Legends celebration event.",
  kDemaciaPass:
    "League Classic's battle pass — earn track rewards. Its active window is also the best real signal ModeAlert has for when League Classic (the old-school alternate client) is actually queueable.",
};

// Same eventHubType lookup used for descriptions, mapped to a
// category instead. Unknown hub types default to PLAYABLE — the
// event-hub feed's entries are, overwhelmingly, real time-boxed
// events tied to something players actually do in-client.
const EVENT_HUB_TYPE_CATEGORIES: Record<string, EventCategory> = {
  kSeasonPass: EVENT_CATEGORIES.SEASON_PASS,
  kDemaciaPass: EVENT_CATEGORIES.SEASON_PASS,
  kActivityCenterMilestones: EVENT_CATEGORIES.PLAYABLE,
  kHallOfLegends: EVENT_CATEGORIES.PLAYABLE,
};

// Rotating featured modes (ARAM Mayhem, URF, Arena) publish their
// season-long progression-track entry under kSeasonPass, same as any
// other battle pass. There's still no reliable "is the mode actually
// in rotation right now" signal (see docs/06_DECISIONS.md ADR-017/
// ADR-020) — but per Deniz, these are too important to hide entirely.
// They're categorized/described honestly as a battle-pass window
// instead: visible and trackable, never claimed to mean the mode
// itself is live.
const ROTATING_MODE_TITLE_MATCHES = ["Mayhem", "URF", "Arena"];

function isRotatingModeWrapper(
  title: string
): boolean {
  return ROTATING_MODE_TITLE_MATCHES.some((match) =>
    title.includes(match)
  );
}

// "Token Bank" entries track pass-currency balances, not something a
// player plays — same administrative family as the season-pass
// windows themselves, not a real piece of content like Hall of
// Legends or a named collab event.
function isPassCurrencyWrapper(
  title: string
): boolean {
  return title.includes("Token Bank");
}

function describeEvent(
  event: CommunityDragonEventHubEntry["event"],
  title: string
): string {
  const base =
    EVENT_HUB_TYPE_LABELS[event.eventHubType] ??
    "League of Legends event.";

  const description = event.localizedEventSubtitle
    ? `${event.localizedEventSubtitle} — ${base}`
    : base;

  if (
    event.eventHubType === "kSeasonPass" &&
    isRotatingModeWrapper(title)
  ) {
    return `${description} This is the battle-pass window only — whether the mode itself is in rotation today isn't something Riot exposes a reliable signal for yet.`;
  }

  return description;
}

function categorizeEvent(
  event: CommunityDragonEventHubEntry["event"],
  title: string
): EventCategory {
  if (
    event.eventHubType === "kSeasonPass" &&
    isRotatingModeWrapper(title)
  ) {
    return EVENT_CATEGORIES.SEASON_PASS;
  }

  if (isPassCurrencyWrapper(title)) {
    return EVENT_CATEGORIES.SEASON_PASS;
  }

  return (
    EVENT_HUB_TYPE_CATEGORIES[event.eventHubType] ??
    EVENT_CATEGORIES.PLAYABLE
  );
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

// Riot's event-hub uses far-future end dates (e.g. 2099) for permanent
// account features (Classic mode's persistent player-level/voting-power
// trackers) that got swept into the feed alongside real events. They'd
// otherwise show as permanently LIVE — not a real time-boxed event.
const PERMANENT_FEATURE_SENTINEL_YEAR = 2090;

function isTrackableEntry(
  entry: CommunityDragonEventHubEntry
): boolean {
  const { event } = entry;

  const endYear = new Date(
    event.endDate
  ).getFullYear();

  if (endYear >= PERMANENT_FEATURE_SENTINEL_YEAR) {
    return false;
  }

  return true;
}

function toProviderEvent(
  entry: CommunityDragonEventHubEntry,
  now: Date
): ProviderEvent {
  const { event } = entry;

  const title =
    event.localizedShortName ||
    event.localizedName;

  return {
    id: `communitydragon-event-${event.eventId}`,

    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

    title,

    description: describeEvent(event, title),

    status: computeStatus(
      event.startDate,
      event.endDate,
      now
    ),

    category: categorizeEvent(event, title),

    trackedUsers: 0,

    checkedAt: now,
  };
}

export function normalizeEventHub(
  response: CommunityDragonEventHubResponse,
  now: Date = new Date()
): ProviderEvent[] {
  return response
    .filter(isTrackableEntry)
    .map((entry) =>
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
    .filter(isTrackableEntry)
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
    .filter(isTrackableEntry)
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
