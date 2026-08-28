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

import {
  renderEventDescription,
  type EventDescriptionParams,
} from "@/lib/i18n/event-descriptions";

// The event-hub feed has no free-text description field — only image
// URLs and this type code — so descriptions are built from a small,
// fixed lookup rather than invented per event. Each hub type maps to
// a key in lib/i18n/event-descriptions.ts's RENDERERS.
const EVENT_HUB_TYPE_LABELS: Record<string, string> = {
  kSeasonPass: "Season pass — earn track rewards through featured missions.",
  kActivityCenterMilestones:
    "Limited-time milestone event with special rewards.",
  kHallOfLegends: "Hall of Legends celebration event.",
  kDemaciaPass: "Classic-mode battle pass — earn track rewards.",
};

const EVENT_HUB_TYPE_DESCRIPTION_KEYS: Record<string, string> = {
  kSeasonPass: "communitydragon.seasonPass",
  kActivityCenterMilestones: "communitydragon.milestone",
  kHallOfLegends: "communitydragon.hallOfLegends",
  kDemaciaPass: "communitydragon.demaciaPass",
};

// Same eventHubType lookup used for descriptions, mapped to a
// category instead. Unknown hub types default to PLAYABLE — the
// event-hub feed's entries are, overwhelmingly, real time-boxed
// events tied to something players actually do in-client.
//
// kSeasonPass/kDemaciaPass are SEASON_PASS (reward tracks — Season N:
// Act X, Spirit Blossom Beyond, Classic Pass — none of these are a
// mode you queue into, just a track you earn rewards through). The
// mode each pass is tied to, when confirmed real and worth tracking
// on its own, gets its own dedicated PLAYABLE entry instead — see
// lib/providers/rotating-modes/provider.ts and ADR-029 (ARAM: Mayhem
// and League Classic both confirmed permanent by Riot, verified via
// WebSearch 2026-08-12, so they're no longer inferred from a pass
// window — they have their own real, standalone entries now).
const EVENT_HUB_TYPE_CATEGORIES: Record<string, EventCategory> = {
  kSeasonPass: EVENT_CATEGORIES.SEASON_PASS,
  kDemaciaPass: EVENT_CATEGORIES.SEASON_PASS,
  kActivityCenterMilestones: EVENT_CATEGORIES.PLAYABLE,
  kHallOfLegends: EVENT_CATEGORIES.PLAYABLE,
};

// URF and Arena still have no confirmed-permanent status and no
// dedicated real entry to stand on their own (see ADR-026/ADR-029) —
// their event-hub season-pass wrapper (when one exists) is still the
// best available signal, filed as PLAYABLE with an honest hedge in
// the description. Mayhem was removed from this list: it's now a
// confirmed-permanent mode with its own dedicated entry, so its pass
// window can go back to being a plain, unhedged SEASON_PASS.
const UNCONFIRMED_ROTATING_MODE_TITLE_MATCHES = ["URF", "Arena"];

function isUnconfirmedRotatingModeWrapper(
  title: string
): boolean {
  return UNCONFIRMED_ROTATING_MODE_TITLE_MATCHES.some((match) =>
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

// The event-hub's own title for URF/Arena's pass wrapper is a
// pass-tier name ("URF Set 2") — real and accurate, but not the name
// a player would recognize. Renamed to the real mode name from
// queues.json for display only; dates/status still come from this
// real, dated event-hub entry. Mayhem/Classic are NOT renamed here
// anymore — they have their own dedicated, standalone permanent
// entries now (see ADR-029), so their pass-window title stays as
// Riot's own real pass-tier name to avoid two rows sharing one name.
function canonicalModeTitle(
  rawTitle: string
): string | null {
  if (rawTitle.includes("URF")) {
    return "URF";
  }

  if (rawTitle.includes("Arena")) {
    return "Arena";
  }

  return null;
}

interface DescribedEvent {
  description: string;
  descriptionKey?: string;
  descriptionParams?: EventDescriptionParams;
}

function describeEvent(
  event: CommunityDragonEventHubEntry["event"],
  title: string,
  status: ProviderEventStatus
): DescribedEvent {
  const base =
    EVENT_HUB_TYPE_LABELS[event.eventHubType] ??
    "League of Legends event.";

  let description = event.localizedEventSubtitle
    ? `${event.localizedEventSubtitle} — ${base}`
    : base;

  const hasUnconfirmedSuffix =
    event.eventHubType === "kSeasonPass" &&
    isUnconfirmedRotatingModeWrapper(title);

  if (hasUnconfirmedSuffix) {
    description = `${description} This is the battle-pass window only — whether the mode itself is in rotation today isn't something Riot exposes a reliable signal for yet.`;
  }

  const progressClosed = status === "TRACKING" && event.progressEndDate;

  if (progressClosed) {
    description = `${description} Pass progress has closed — the shop stays open until ${new Date(event.endDate).toLocaleDateString()} for remaining purchases, but no more track progress can be earned.`;
  }

  // Real third-party text (Riot's own localizedEventSubtitle) can't
  // be translated — only the fully ModeAlert-authored case (no
  // subtitle) gets a descriptionKey. See docs/06_DECISIONS.md ADR-054
  // "Faz 3".
  if (event.localizedEventSubtitle) {
    return { description };
  }

  const baseKey =
    EVENT_HUB_TYPE_DESCRIPTION_KEYS[event.eventHubType] ??
    "communitydragon.genericEvent";

  const descriptionParams: EventDescriptionParams = {
    baseKey,
    hasUnconfirmedSuffix: hasUnconfirmedSuffix ? 1 : undefined,
    progressEndDate: progressClosed
      ? new Date(event.endDate).toISOString()
      : undefined,
  };

  return {
    description:
      renderEventDescription(
        "communitydragon.description",
        descriptionParams,
        "en"
      ) ?? description,
    descriptionKey: "communitydragon.description",
    descriptionParams,
  };
}

function categorizeEvent(
  event: CommunityDragonEventHubEntry["event"],
  title: string
): EventCategory {
  if (
    event.eventHubType === "kSeasonPass" &&
    isUnconfirmedRotatingModeWrapper(title)
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

// Groups event-hub entries that are real, successive occurrences of
// the same recurring thing under one series key — confirmed by
// re-fetching the live feed 2026-08-12 and finding it already reports
// multiple past occurrences of each of these by name (e.g. "Season 3:
// Act I" appears twice, once in 2025 and once in 2026; "Hall of
// Legends" and "Hall of Legends 2025" are the same annual event one
// year apart). This is Riot's own real historical data, already
// synced as separate rows — grouping them lets stats/predictions look
// at the whole recurring pattern instead of just one occurrence.
//
// Deliberately NOT grouped: one-off narrative campaigns ("Welcome to
// Noxus", "Spirit Blossom Beyond", "Swain's Hot Chicken", "Arcane
// Anniversary") — these are different content each time, not
// iterations of the same thing, so treating them as one series would
// misrepresent them as recurring when they're each a distinct,
// standalone collab/event.
function deriveSeriesKey(
  event: CommunityDragonEventHubEntry["event"],
  title: string
): string | undefined {
  if (event.eventHubType === "kHallOfLegends") {
    return "lol-hall-of-legends";
  }

  if (event.eventHubType === "kDemaciaPass") {
    return "lol-classic-pass";
  }

  if (event.eventHubType === "kSeasonPass") {
    if (title.includes("Mayhem")) {
      return "lol-mayhem-pass";
    }

    if (title.includes("URF")) {
      return "lol-urf-pass";
    }

    if (title.includes("Arena")) {
      return "lol-arena-pass";
    }

    if (/^Season \d+: Act/.test(title)) {
      return "lol-ranked-season-pass";
    }
  }

  return undefined;
}

// `progressEndDate` (when present) is the real, live-in-the-response
// date pass-progress stops being earnable — confirmed via WebSearch
// against Riot's own event-pass announcements (e.g. Hall of Legends
// 2024: "runs until July 15, Pass Progress end date of July 8", which
// matches this feed's real startDate/progressEndDate/endDate for that
// exact entry). `endDate` is later, a claim-only tail where the event
// shop stays open but no more progress can be earned — distinct
// enough from a plain LIVE window to surface as TRACKING, same
// "sub-phase within one window" pattern as Foxhole's resistance phase
// (see foxhole/event-mapper.ts).
function computeStatus(
  startDate: string,
  endDate: string,
  now: Date,
  progressEndDate?: string
): ProviderEventStatus {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return "UPCOMING";
  }

  if (now > end) {
    return "ENDED";
  }

  if (
    progressEndDate &&
    now > new Date(progressEndDate)
  ) {
    return "TRACKING";
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

  const title = canonicalModeTitle(rawTitle) ?? rawTitle;

  const status = computeStatus(
    event.startDate,
    event.endDate,
    now,
    event.progressEndDate
  );

  const described = describeEvent(event, title, status);

  return {
    id: `communitydragon-event-${event.eventId}`,

    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

    title,

    description: described.description,
    descriptionKey: described.descriptionKey,
    descriptionParams: described.descriptionParams,

    status,

    category: categorizeEvent(event, title),

    // Every event-hub entry has a real start/end date — it's
    // structurally time-boxed content, never a permanent feature.
    isLimitedTime: true,

    seriesKey: deriveSeriesKey(event, rawTitle),

    trackedUsers: 0,

    checkedAt: now,
  };
}

// "ARAM: Mayhem Classic-ish" has no event-hub entry of its own to
// derive real dates from (verified — checked both live and PBE
// feeds). It's a Classic-mode-themed ARAM Mayhem crossover, so its
// closest real signal is League Classic's own pass window (the
// kDemaciaPass entry): while that's live, Deniz's own client showed
// this variant as selectable (2026-08-12) — while it's not, there's
// no better guess available. This replaces the old static
// always-ENDED placeholder (see ADR-027), which was wrong the moment
// League Classic's pass went live.
function toClassicMayhemCompanion(
  event: CommunityDragonEventHubEntry["event"],
  now: Date
): ProviderEvent {
  return {
    id: "lol-mode-aram-mayhem-classic",

    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

    title: "ARAM: Mayhem Classic-ish",

    description: renderEventDescription(
      "communitydragon.mayhemClassicCompanion",
      {},
      "en"
    )!,
    descriptionKey: "communitydragon.mayhemClassicCompanion",
    descriptionParams: {},

    status: computeStatus(
      event.startDate,
      event.endDate,
      now
    ),

    category: EVENT_CATEGORIES.PLAYABLE,

    isLimitedTime: true,

    trackedUsers: 0,

    checkedAt: now,
  };
}

function toProviderEvents(
  entry: CommunityDragonEventHubEntry,
  now: Date
): ProviderEvent[] {
  const base = toProviderEvent(entry, now);

  if (entry.event.eventHubType === "kDemaciaPass") {
    return [base, toClassicMayhemCompanion(entry.event, now)];
  }

  return [base];
}

export function normalizeEventHub(
  response: CommunityDragonEventHubResponse,
  now: Date = new Date()
): ProviderEvent[] {
  return response
    .filter(isTrackableEntry)
    .flatMap((entry) =>
      toProviderEvents(entry, now)
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
        now,
        event.progressEndDate
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
