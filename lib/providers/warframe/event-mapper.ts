import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";

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

  return [
    {
      id: "warframe-void-trader",
      gameId: GAME_IDS.WARFRAME,
      title,
      status,
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
      status,
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
      status: "LIVE",
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
      status: "LIVE",
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
