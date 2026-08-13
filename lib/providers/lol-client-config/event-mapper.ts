import type {
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

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

  description: string;
}

const KNOWN_QUEUES: KnownQueue[] = [
  {
    queueId: 900,
    id: "lol-live-urf",
    title: "URF",
    description:
      "Ultra Rapid Fire — near-zero cooldowns, no mana, random champion.",
  },
  {
    queueId: 1900,
    id: "lol-live-pick-urf",
    title: "Pick URF",
    description:
      "URF with normal draft-style champion picking instead of a random champion.",
  },
  {
    queueId: 1700,
    id: "lol-live-arena",
    title: "Arena",
    description:
      "2v2v2v2v2v2v2v2 round-based combat with augments.",
  },
  {
    queueId: 1740,
    id: "lol-live-bravery-arena",
    title: "Bravery Arena",
    description:
      "Arena's weekly variant — Bravery and Crowd Favorites rules.",
  },
  {
    queueId: 1750,
    id: "lol-live-arena-3x6",
    title: "Arena 3x6",
    description:
      "Arena's 3-player-team variant, six total compositions.",
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

    const description =
      liveRegions.length > 0
        ? `${queue.description} Currently enabled in ${liveRegions.length} region${liveRegions.length === 1 ? "" : "s"} (${liveRegions.map((region) => region.toUpperCase()).join(", ")}), per Riot's own live client config service (clientconfig.rpg.riotgames.com) — a real, keyless, per-region signal checked fresh on every sync, not a one-time snapshot.`
        : `${queue.description} Not currently enabled in any checked region, per Riot's own live client config service (clientconfig.rpg.riotgames.com) — checked fresh on every sync, so this updates on its own the moment it changes.`;

    return {
      id: queue.id,

      gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

      title: queue.title,

      description,

      status,

      category: EVENT_CATEGORIES.PLAYABLE,

      isLimitedTime: true,

      trackedUsers: 0,

      checkedAt: now,
    };
  });
}
