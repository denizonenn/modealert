import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";

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

  const descriptionKey = active
    ? "warframe.voidTraderActive"
    : "warframe.voidTraderUpcoming";
  const descriptionParams = {
    character: trader.character,
    location: trader.location,
  };

  return [
    {
      id: "warframe-void-trader",
      gameId: GAME_IDS.WARFRAME,
      title,
      description: renderEventDescription(
        descriptionKey,
        descriptionParams,
        "en"
      )!,
      descriptionKey,
      descriptionParams,
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

  const descriptionKey = nightwave.active
    ? "warframe.nightwaveActive"
    : "warframe.nightwaveIntermission";
  const descriptionParams = { season: nightwave.season };

  return [
    {
      id: "warframe-nightwave",
      gameId: GAME_IDS.WARFRAME,
      title: `Nightwave — Season ${nightwave.season}`,
      description: renderEventDescription(
        descriptionKey,
        descriptionParams,
        "en"
      )!,
      descriptionKey,
      descriptionParams,
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
      description: renderEventDescription(
        "warframe.sortie",
        { boss: sortie.boss },
        "en"
      )!,
      descriptionKey: "warframe.sortie",
      descriptionParams: { boss: sortie.boss },
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
      description: renderEventDescription(
        "warframe.archonHunt",
        { boss: archonHunt.boss },
        "en"
      )!,
      descriptionKey: "warframe.archonHunt",
      descriptionParams: { boss: archonHunt.boss },
      status: "LIVE",
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}

// Weekly-reset endgame missions (3-mission chains, no loadout
// switching mid-run, unlocked via Search Pulses). Found via WebSearch
// 2026-08-12 while researching real recurring content across every
// tracked game; confirmed the field is already in the same worldstate
// response this provider already fetches (`archimedeas`, real
// activation/expiry). Live data has 2 concurrent entries sharing one
// weekly window — each one's own `type`/`typeKey` field turned out to
// be an obfuscated internal string (e.g. "C T_ L A B", "C T_ H E X"),
// not a real "Deep"/"Temporal" label, so a prior version of this code
// guessed "Deep Archimedea" as the title, which was never actually
// verified. Fixed 2026-08-19: both entries are now emitted (dropping
// the second was a real, silent gap — a distinct real mission chain
// with its own risks/modifiers was going untracked), titled generically
// since there's no reliable name to tell them apart, but the
// description now lists their real mission-type sequence (e.g.
// "Alchemy → Extermination → Assassination"), which the response
// does expose cleanly and honestly differentiates the two.
function mapArchimedea(
  archimedeas: WarframeWorldstate["archimedeas"],
  now: Date
): ProviderEvent[] {
  if (!archimedeas || archimedeas.length === 0) {
    return [];
  }

  const multiple = archimedeas.length > 1;

  return archimedeas.map((current, index) => {
    const active = isWithin(current.activation, current.expiry, now);

    const missionSequence = current.missions
      ?.map((mission) => mission.missionType)
      .join(" → ");

    const title = multiple
      ? `Weekly Archimedea (Variant ${index + 1})`
      : "Weekly Archimedea";

    const descriptionKey = active
      ? "warframe.archimedeaActive"
      : "warframe.archimedeaInactive";
    const descriptionParams = active ? { missionSequence } : {};

    return {
      id: `warframe-archimedea-${current.id}`,
      gameId: GAME_IDS.WARFRAME,
      title,
      description: renderEventDescription(
        descriptionKey,
        descriptionParams,
        "en"
      )!,
      descriptionKey,
      descriptionParams,
      status: active ? "LIVE" : "ENDED",
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    };
  });
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
      description: renderEventDescription(
        active ? "warframe.vaultTraderActive" : "warframe.vaultTraderInactive",
        { character: trader.character, location: trader.location },
        "en"
      )!,
      descriptionKey: active
        ? "warframe.vaultTraderActive"
        : "warframe.vaultTraderInactive",
      descriptionParams: {
        character: trader.character,
        location: trader.location,
      },
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
      description: renderEventDescription(
        active ? "warframe.steelPathActive" : "warframe.steelPathInactive",
        { rewardName },
        "en"
      )!,
      descriptionKey: active
        ? "warframe.steelPathActive"
        : "warframe.steelPathInactive",
      descriptionParams: { rewardName },
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
