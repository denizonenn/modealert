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
    "The old-school alternate client's battle pass. Riot doesn't publish a separate 'is League Classic queueable' signal, so this pass being open is the best real indicator ModeAlert has.",
};

// Same eventHubType lookup used for descriptions, mapped to a
// category instead. Unknown hub types default to PLAYABLE — the
// event-hub feed's entries are, overwhelmingly, real time-boxed
// events tied to something players actually do in-client.
//
// kSeasonPass/kDemaciaPass default to SEASON_PASS (narrative content
// tracks like "Season 3: Act I" or "Spirit Blossom Beyond" — earn
// missions, unlock skins, not a mode you queue into). The exception
// is rotating-mode wrappers (Mayhem/URF/Arena) and kDemaciaPass
// itself (League Classic's pass) — see below, both PLAYABLE, because
// per Deniz these represent a real mode a player queues into, not
// just a reward track.
const EVENT_HUB_TYPE_CATEGORIES: Record<string, EventCategory> = {
  kSeasonPass: EVENT_CATEGORIES.SEASON_PASS,
  kDemaciaPass: EVENT_CATEGORIES.PLAYABLE,
  kActivityCenterMilestones: EVENT_CATEGORIES.PLAYABLE,
  kHallOfLegends: EVENT_CATEGORIES.PLAYABLE,
};

// Rotating featured modes (ARAM Mayhem, URF, Arena) publish their
// season-long progression-track entry under kSeasonPass, same as any
// other battle pass. There's still no reliable "is the mode actually
// in rotation right now" signal (see docs/06_DECISIONS.md ADR-017/
// ADR-020) — but per Deniz, these represent a real mode he wants
// filed as PLAYABLE, not tucked away as a generic season pass. The
// hedge stays in the description instead: visible and trackable
// under the category he actually wants, but never claiming the mode
// itself is confirmed live.
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

// The event-hub's own title for a rotating-mode/Classic pass is a
// pass-tier name ("Mayhem Set 2", "Classic Pass: Act I") — real and
// accurate, but not the name a player would recognize as the actual
// mode. The real mode names come from CommunityDragon's public
// queues.json (verified 2026-08-12, see ADR-026/ADR-027) — used here
// for display only. The dates/status driving this event still come
// entirely from this real, dated event-hub entry; only the label
// changes.
function canonicalModeTitle(
  event: CommunityDragonEventHubEntry["event"],
  rawTitle: string
): string | null {
  if (event.eventHubType === "kDemaciaPass") {
    return "League Classic";
  }

  if (rawTitle.includes("Mayhem")) {
    return "ARAM: Mayhem";
  }

  if (rawTitle.includes("URF")) {
    return "URF";
  }

  if (rawTitle.includes("Arena")) {
    return "Arena";
  }

  return null;
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
    return EVENT_CATEGORIES.PLAYABLE;
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

  const rawTitle =
    event.localizedShortName ||
    event.localizedName;

  const title = canonicalModeTitle(event, rawTitle) ?? rawTitle;

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

    // Every event-hub entry has a real start/end date — it's
    // structurally time-boxed content, never a permanent feature.
    isLimitedTime: true,

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
