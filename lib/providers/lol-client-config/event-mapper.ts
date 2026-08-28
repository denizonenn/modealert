import type {
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";

import type {
  ClientConfigQueueEntry,
  ClientConfigResponse,
} from "./types";

// Real League queue ids for the rotating modes CommunityDragon's
// static event-hub/queues.json can't answer "is this active right
// now" for (see docs/06_DECISIONS.md ADR-036/ADR-037). Separate rows
// per real queue id, not one umbrella row per mode family — same
// queue-level-granularity precedent as Summoner's Rift's core queues
// (ADR-026). Titles disambiguated where Riot's own queue name would
// otherwise collide (900 and 1900 are both internally "URF").
interface KnownQueue {
  queueId: number;

  id: string;

  title: string;

  // Key into lib/i18n/event-descriptions.ts's RENDERERS map for this
  // queue's static description text (before the live-region suffix
  // below is appended).
  descriptionKey: string;

  // Structurally permanent (ARAM Mayhem/League Classic, confirmed by
  // Riot's own dev updates — see ADR-029) vs genuinely rotating
  // (everything else here). Independent of the live-computed
  // `status` below — a permanent mode can still show ENDED if this
  // service ever reports it disabled everywhere, which would itself
  // be real, meaningful information, not something to hide.
  isLimitedTime?: boolean;
}

const KNOWN_QUEUES: KnownQueue[] = [
  {
    queueId: 900,
    id: "lol-live-urf",
    title: "URF",
    descriptionKey: "lol.urf",
  },
  {
    queueId: 1900,
    id: "lol-live-pick-urf",
    title: "Pick URF",
    descriptionKey: "lol.pickUrf",
  },
  {
    queueId: 1700,
    id: "lol-live-arena",
    title: "Arena",
    descriptionKey: "lol.arena",
  },
  {
    queueId: 1740,
    id: "lol-live-bravery-arena",
    title: "Bravery Arena",
    descriptionKey: "lol.braveryArena",
  },
  {
    queueId: 1750,
    id: "lol-live-arena-3x6",
    title: "Arena 3x6",
    descriptionKey: "lol.arena3x6",
  },
  {
    queueId: 2400,
    id: "lol-live-aram-mayhem",
    title: "ARAM: Mayhem",
    descriptionKey: "lol.aramMayhem",
    isLimitedTime: false,
  },
  {
    queueId: 4310,
    id: "lol-live-league-classic",
    title: "League Classic",
    descriptionKey: "lol.leagueClassic",
    isLimitedTime: false,
  },
];

function isClientConfigQueueEntry(
  value: unknown
): value is ClientConfigQueueEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ClientConfigQueueEntry).queueId ===
      "number"
  );
}

// `configsByRegion[region]` must be the response fetched with THAT
// region's own `region` query param — a response fetched for a
// different region reports stale/wrong data for this region (see
// constants.ts and client.ts; caught by cross-checking against
// isurfback.com before this shipped).
function isQueueLiveInRegion(
  configsByRegion: Record<string, ClientConfigResponse>,
  region: string,
  queueId: number
): boolean {
  const config = configsByRegion[region];

  if (!config) {
    return false;
  }

  const queueConfigs =
    config[
      `lol.${region}.operational.queues.queueConfigs`
    ];

  if (!Array.isArray(queueConfigs)) {
    return false;
  }

  const entry = queueConfigs.find(
    (candidate) =>
      isClientConfigQueueEntry(candidate) &&
      candidate.queueId === queueId
  ) as ClientConfigQueueEntry | undefined;

  return Boolean(
    entry?.isEnabled && entry?.isVisibleInClient
  );
}

export function mapQueueStatuses(
  configsByRegion: Record<string, ClientConfigResponse>,
  now: Date = new Date()
): ProviderEvent[] {
  const regions = Object.keys(configsByRegion);

  return KNOWN_QUEUES.map((queue) => {
    const liveRegions = regions.filter((region) =>
      isQueueLiveInRegion(
        configsByRegion,
        region,
        queue.queueId
      )
    );

    const status: ProviderEventStatus =
      liveRegions.length > 0 ? "LIVE" : "ENDED";

    const descriptionParams = {
      baseKey: queue.descriptionKey,
      liveRegionCount:
        liveRegions.length > 0 ? liveRegions.length : undefined,
      regions: liveRegions
        .map((region) => region.toUpperCase())
        .join(", "),
    };

    return {
      id: queue.id,

      gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

      title: queue.title,

      description: renderEventDescription(
        "lol.queueStatus",
        descriptionParams,
        "en"
      )!,
      descriptionKey: "lol.queueStatus",
      descriptionParams,

      status,

      category: EVENT_CATEGORIES.PLAYABLE,

      isLimitedTime: queue.isLimitedTime ?? true,

      trackedUsers: 0,

      checkedAt: now,
    };
  });
}
