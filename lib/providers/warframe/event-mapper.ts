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

export function mapWarframeEvents(
  worldstate: WarframeWorldstate
): ProviderEvent[] {
  const now = new Date();

  return [
    ...mapVoidTrader(worldstate.voidTrader, now),
    ...mapNightwave(worldstate.nightwave, now),
    ...mapSortie(worldstate.sortie, now),
    ...mapArchonHunt(worldstate.archonHunt, now),
  ];
}
