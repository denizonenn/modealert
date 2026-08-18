import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

import type { WarframeWorldstate } from "./types";

function isWithin(activation: string, expiry: string, now: Date): boolean {
  return now >= new Date(activation) && now <= new Date(expiry);
}

function mapVoidTrader(
  trader: WarframeWorldstate["voidTrader"],
  now: Date
): ProviderEvent[] {
  if (!trader) {
    return [];
  }

  const active = isWithin(trader.activation, trader.expiry, now);

  const status: ProviderEventStatus = active ? "LIVE" : "UPCOMING";

  const title = active
    ? `${trader.character} at ${trader.location}`
    : `${trader.character} arriving at ${trader.location}`;

  const description = active
    ? `${trader.character} is selling rare rotating wares at ${trader.location} for a limited time.`
    : `${trader.character} is scheduled to arrive at ${trader.location} for a 48-hour visit.`;

  return [
    {
      id: "warframe-void-trader",
      gameId: GAME_IDS.WARFRAME,
      title,
      description,
      status,
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

function mapNightwave(
  nightwave: WarframeWorldstate["nightwave"],
  now: Date
): ProviderEvent[] {
  if (!nightwave) {
    return [];
  }

  const status: ProviderEventStatus = nightwave.active
    ? "LIVE"
    : "TRACKING";

  return [
    {
      id: "warframe-nightwave",
      gameId: GAME_IDS.WARFRAME,
      title: `Nightwave — Season ${nightwave.season}`,
      description: nightwave.active
        ? `Season ${nightwave.season} of Nightwave is active — complete weekly/daily acts for Wolf Creds and rewards.`
        : `Nightwave Season ${nightwave.season} is between seasons (intermission) — no active acts right now.`,
      status,
      category: EVENT_CATEGORIES.SEASON_PASS,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

function mapSortie(
  sortie: WarframeWorldstate["sortie"],
  now: Date
): ProviderEvent[] {
  if (!sortie || sortie.expired) {
    return [];
  }

  return [
    {
      id: "warframe-sortie",
      gameId: GAME_IDS.WARFRAME,
      title: `Sortie — ${sortie.boss}`,
      description: `Today's 3-mission Sortie chain ends with a boss fight against ${sortie.boss}. Resets daily.`,
      status: "LIVE",
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

function mapArchonHunt(
  archonHunt: WarframeWorldstate["archonHunt"],
  now: Date
): ProviderEvent[] {
  if (!archonHunt) {
    return [];
  }

  return [
    {
      id: "warframe-archon-hunt",
      gameId: GAME_IDS.WARFRAME,
      title: `Archon Hunt — ${archonHunt.boss}`,
      description: `This week's 3-mission Archon Hunt chain (no life support, no revives) ends with a fight against ${archonHunt.boss}. Resets weekly.`,
      status: "LIVE",
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

// Deep/Temporal Archimedea — weekly-reset endgame missions (3-mission
// chains, no loadout switching mid-run, unlocked via Search Pulses).
// Found via WebSearch 2026-08-12 while researching real recurring
// content across every tracked game; confirmed the field is already
// in the same worldstate response this provider already fetches
// (`archimedeas`, real activation/expiry, verified live 2026-08-12 —
// two concurrent entries sharing one weekly window, most likely Deep
// + Temporal variants). Only one combined event is emitted since both
// entries share the same real window and the API doesn't expose a
// clean human-readable name to tell them apart.
function mapArchimedea(
  archimedeas: WarframeWorldstate["archimedeas"],
  now: Date
): ProviderEvent[] {
  const current = archimedeas?.[0];

  if (!current) {
    return [];
  }

  const active = isWithin(current.activation, current.expiry, now);

  return [
    {
      id: "warframe-archimedea",
      gameId: GAME_IDS.WARFRAME,
      title: "Deep Archimedea",
      description: active
        ? "This week's 3-mission Archimedea chain — no loadout switching between missions, unlocked with Search Pulses. Resets weekly."
        : "Between weekly Archimedea windows.",
      status: active ? "LIVE" : "ENDED",
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

// Prime Vault Resurgence — Varzia's rotating shop of previously-vaulted
// Prime items at Maroo's Bazaar. Found 2026-08-18 while auditing this
// provider's own worldstate response for fields we weren't mapping yet
// — `vaultTrader` was already in every payload this provider fetches,
// just never read. Real, ~monthly cadence (activation/expiry span
// weeks, not hours), same trust class as the other 5 activities here.
function mapVaultTrader(
  trader: WarframeWorldstate["vaultTrader"],
  now: Date
): ProviderEvent[] {
  if (!trader) {
    return [];
  }

  const active = isWithin(trader.activation, trader.expiry, now);

  return [
    {
      id: "warframe-vault-trader",
      gameId: GAME_IDS.WARFRAME,
      title: `${trader.character} — Prime Resurgence`,
      description: active
        ? `${trader.character} is selling a rotating selection of vaulted Prime gear at ${trader.location} for Ducats/Aya.`
        : `Prime Resurgence is between rotations at ${trader.location}.`,
      status: active ? "LIVE" : "ENDED",
      category: EVENT_CATEGORIES.COSMETIC_SHOP,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

// Steel Path Circuit's weekly rotating reward — same discovery pass as
// Prime Resurgence above. Real weekly cadence.
function mapSteelPath(
  steelPath: WarframeWorldstate["steelPath"],
  now: Date
): ProviderEvent[] {
  if (!steelPath) {
    return [];
  }

  const active = isWithin(steelPath.activation, steelPath.expiry, now);
  const rewardName = steelPath.currentReward?.name;

  return [
    {
      id: "warframe-steel-path",
      gameId: GAME_IDS.WARFRAME,
      title: rewardName
        ? `Steel Path Circuit — ${rewardName}`
        : "Steel Path Circuit",
      description: active
        ? `This week's Steel Path Circuit honor reward${rewardName ? `: ${rewardName}` : ""}. Resets weekly.`
        : "Between weekly Steel Path Circuit reward rotations.",
      status: active ? "LIVE" : "ENDED",
      category: EVENT_CATEGORIES.SEASON_PASS,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

export function mapWarframeEvents(
  worldstate: WarframeWorldstate
): ProviderEvent[] {
  const now = new Date();

  return [
    ...mapVoidTrader(worldstate.voidTrader, now),
    ...mapNightwave(worldstate.nightwave, now),
    ...mapSortie(worldstate.sortie, now),
    ...mapArchonHunt(worldstate.archonHunt, now),
    ...mapArchimedea(worldstate.archimedeas, now),
    ...mapVaultTrader(worldstate.vaultTrader, now),
    ...mapSteelPath(worldstate.steelPath, now),
  ];
}
