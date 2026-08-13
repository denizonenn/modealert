import type { ProviderEvent, ProviderEventStatus } from "../core/provider";
import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import type {
  DestinyMilestoneDefinitionTable,
  DestinyPublicMilestonesResponse,
  DestinySettingsResponse,
} from "./types";

export function mapPlatformStatus(
  settings: DestinySettingsResponse
): ProviderEvent[] {
  const enabled = settings.systems.Destiny2?.enabled ?? true;

  const status: ProviderEventStatus = enabled ? "LIVE" : "TRACKING";

  return [
    {
      id: "destiny-platform-status",
      gameId: GAME_IDS.DESTINY_2,
      title: "Platform Status",
      description: enabled
        ? "Destiny 2 servers are operating normally, no maintenance scheduled."
        : "Destiny 2 has an active maintenance window — the game may be unreachable.",
      status,
      category: EVENT_CATEGORIES.PLATFORM_STATUS,
      isLimitedTime: false,
      trackedUsers: 0,
      checkedAt: new Date(),
    },
  ];
}

export function mapActiveMilestones(
  milestones: DestinyPublicMilestonesResponse,
  definitions: DestinyMilestoneDefinitionTable
): ProviderEvent[] {
  const now = new Date();

  return Object.values(milestones)
    .map((milestone): ProviderEvent | null => {
      const displayProperties =
        definitions[String(milestone.milestoneHash)]?.displayProperties;

      const name = displayProperties?.name;

      if (!name) {
        return null;
      }

      return {
        id: `destiny-milestone-${milestone.milestoneHash}`,
        gameId: GAME_IDS.DESTINY_2,
        title: name,
        description: displayProperties?.description || undefined,
        status: "LIVE",
        category: EVENT_CATEGORIES.ROTATION_MILESTONE,
        isLimitedTime: true,
        trackedUsers: 0,
        checkedAt: now,
      };
    })
    .filter((event): event is ProviderEvent => event !== null);
}

// Iron Banner has no entry in Bungie's Public Milestones API at all
// (verified 2026-08-12 — the live DestinyMilestoneDefinition table
// has 31 entries total, zero of them Iron Banner; Trials of Osiris
// does have one, "Trials Returns", so it's already covered by
// mapActiveMilestones above when active). Since Destiny 2's live-
// service development ended 2026-06-09 (see docs/06_DECISIONS.md
// ADR-033), its schedule is now permanently fixed — Bungie's own
// official account (@DestinyTheGame) announced it directly: "Iron
// Banner will return on June 30, 2026, and then every 4 weeks after"
// (verified via WebSearch 2026-08-12). Computed from that real,
// dated anchor + cadence — a deterministic formula from an official
// source, not a live signal and not a guess.
const IRON_BANNER_ANCHOR = new Date("2026-06-30T00:00:00.000Z");
const IRON_BANNER_CADENCE_DAYS = 28;
const IRON_BANNER_DURATION_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export function mapIronBanner(now: Date): ProviderEvent[] {
  const cycleMs = IRON_BANNER_CADENCE_DAYS * DAY_MS;
  const elapsed = now.getTime() - IRON_BANNER_ANCHOR.getTime();

  const cycleIndex = Math.max(0, Math.floor(elapsed / cycleMs));
  const windowStart = new Date(
    IRON_BANNER_ANCHOR.getTime() + cycleIndex * cycleMs
  );
  const windowEnd = new Date(
    windowStart.getTime() + IRON_BANNER_DURATION_DAYS * DAY_MS
  );

  let status: ProviderEventStatus;
  let description: string;

  if (now < windowStart) {
    status = "UPCOMING";
    description = `Bungie's announced schedule (every 4 weeks starting June 30, 2026) puts the next Iron Banner window starting ${windowStart.toDateString()}.`;
  } else if (now <= windowEnd) {
    status = "LIVE";
    description = `Live per Bungie's announced schedule (every 4 weeks starting June 30, 2026) — this window runs through ${windowEnd.toDateString()}.`;
  } else {
    // ENDED (not UPCOMING) so eventHistoryService correctly closes
    // out the LIVE window it opened — see eventSyncService's
    // syncHistoryForStatus, which only calls finish() on ENDED. The
    // next real start date is still surfaced in the description so
    // nothing useful is lost.
    const nextStart = new Date(windowStart.getTime() + cycleMs);
    status = "ENDED";
    description = `This window ended ${windowEnd.toDateString()}. Next expected ${nextStart.toDateString()}, per Bungie's announced every-4-weeks schedule.`;
  }

  return [
    {
      id: "destiny-iron-banner",
      gameId: GAME_IDS.DESTINY_2,
      title: "Iron Banner",
      description,
      status,
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

// Xûr has no Public Milestones entry (he's a vendor, not a milestone —
// confirmed 2026-08-13 by fetching the live endpoint directly: 12
// milestones total, none of them Xûr) and Bungie's vendor-inventory
// API requires per-character OAuth, which is out of scope the same
// way LCU personalization is (bkz. ADR-001) — ModeAlert only reads
// public, no-login data. What IS public and reliable: Xûr's schedule
// has been Friday 17:00 UTC (daily reset) to Tuesday 17:00 UTC
// (weekly reset) for years, independent of season/set content — a
// core vendor loop, not something that lapsed with Destiny 2's live-
// service wind-down (unlike Iron Banner's cadence above, which needed
// a real announced anchor date). Verified current via WebSearch
// 2026-08-13. Computed fresh every sync from real UTC time, not a
// frozen snapshot.
const XUR_VISIT_DURATION_DAYS = 4;
const XUR_CYCLE_DAYS = 7;

function mostRecentFridayReset(now: Date): Date {
  const daysSinceFriday = (now.getUTCDay() - 5 + 7) % 7;

  const candidate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysSinceFriday,
      17,
      0,
      0,
      0
    )
  );

  if (candidate.getTime() > now.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() - 7);
  }

  return candidate;
}

export function mapXur(now: Date): ProviderEvent[] {
  const arrivalStart = mostRecentFridayReset(now);
  const departureEnd = new Date(
    arrivalStart.getTime() + XUR_VISIT_DURATION_DAYS * DAY_MS
  );

  const isPresent = now.getTime() < departureEnd.getTime();

  let status: ProviderEventStatus;
  let description: string;

  if (isPresent) {
    status = "LIVE";
    description = `Xûr is at his usual spot (the Tower Bazaar) until ${departureEnd.toUTCString()} — computed from his weekly Friday 17:00 UTC to Tuesday 17:00 UTC schedule, not a live inventory API (Bungie doesn't expose vendor stock without per-character auth).`;
  } else {
    const nextArrival = new Date(
      arrivalStart.getTime() + XUR_CYCLE_DAYS * DAY_MS
    );
    status = "ENDED";
    description = `Xûr has left for the week. Back ${nextArrival.toUTCString()}, per his weekly Friday 17:00 UTC schedule.`;
  }

  return [
    {
      id: "destiny-xur",
      gameId: GAME_IDS.DESTINY_2,
      title: "Xûr",
      description,
      status,
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

export function mapDestinyEvents(
  settings: DestinySettingsResponse,
  milestones: DestinyPublicMilestonesResponse,
  definitions: DestinyMilestoneDefinitionTable
): ProviderEvent[] {
  return [
    ...mapPlatformStatus(settings),
    ...mapActiveMilestones(milestones, definitions),
    ...mapIronBanner(new Date()),
    ...mapXur(new Date()),
  ];
}
