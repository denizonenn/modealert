import type { Dictionary } from "@/lib/i18n/load-dictionary";

export const EVENT_CATEGORIES = {
  // A real mode/activity/season a player actually plays right now
  // (or did the last time it ran) — the highest-signal category.
  PLAYABLE: "PLAYABLE",

  // A season/battle-pass reward track. Time-boxed and real, but having
  // the pass open doesn't by itself mean the underlying mode is in
  // rotation right now (e.g. LoL's Mayhem/URF/Arena progression track —
  // see docs/06_DECISIONS.md ADR-017/ADR-020).
  SEASON_PASS: "SEASON_PASS",

  // Recurring scheduled content with a fixed reset cadence (daily/
  // weekly rotations, milestones) rather than a one-off event window.
  ROTATION_MILESTONE: "ROTATION_MILESTONE",

  // Cosmetic/item rotations (shop-style), not gameplay.
  COSMETIC_SHOP: "COSMETIC_SHOP",

  // Server/platform health — always present, lowest player-relevance.
  PLATFORM_STATUS: "PLATFORM_STATUS",
} as const;

export type EventCategory =
  (typeof EVENT_CATEGORIES)[keyof typeof EVENT_CATEGORIES];

// Lower number = shown first. Ended events in a higher-priority
// category still outrank live events in a lower-priority one — see
// CATEGORY_SORT_WEIGHT below, which is what actually encodes "a real
// event you'd play beats infrastructure noise, even ended."
export const EVENT_CATEGORY_PRIORITY: Record<EventCategory, number> = {
  PLAYABLE: 0,
  SEASON_PASS: 1,
  ROTATION_MILESTONE: 2,
  COSMETIC_SHOP: 3,
  PLATFORM_STATUS: 4,
};

// Sort weights, largest to smallest so each dimension dominates the
// one after it: category first (a real played thing beats
// infrastructure noise), then limited-time vs permanent (the rare,
// easy-to-miss thing beats the one that's always there — that's the
// whole point of an alert app), then status as the final tiebreak.
const CATEGORY_SORT_WEIGHT = 100;
const ROTATION_SORT_WEIGHT = 10;

export function categorySortKey(
  category: string,
  isLimitedTime: boolean,
  statusPriority: number
): number {
  const categoryPriority =
    EVENT_CATEGORY_PRIORITY[category as EventCategory] ??
    EVENT_CATEGORY_PRIORITY.PLAYABLE;

  const rotationPriority = isLimitedTime ? 0 : 1;

  return (
    categoryPriority * CATEGORY_SORT_WEIGHT +
    rotationPriority * ROTATION_SORT_WEIGHT +
    statusPriority
  );
}

// English fallbacks — used by the admin panel and other still-English
// surfaces (see docs/09_BACKLOG.md → "Faz 2 — kalan sayfalar"). Pages
// already wired for i18n should use eventCategoryLabel()/
// eventCategoryExample()/rotationFilterLabel() below instead, which
// read from the active dictionary.
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  PLAYABLE: "Playable",
  SEASON_PASS: "Season / Battle Pass",
  ROTATION_MILESTONE: "Rotation & Milestones",
  COSMETIC_SHOP: "Cosmetic Shop",
  PLATFORM_STATUS: "Platform Status",
};

export const EVENT_CATEGORY_EXAMPLES: Record<EventCategory, string> = {
  PLAYABLE:
    "e.g. URF/Arena/Mayhem, PoE league, Helldivers 2 Major Order, Foxhole war",
  SEASON_PASS:
    "e.g. Mayhem/URF Progression Track, Nightwave, Valorant Act",
  ROTATION_MILESTONE:
    "e.g. Champion Rotation, Destiny weekly milestones, Warframe Sortie",
  COSMETIC_SHOP: "e.g. Fortnite Item Shop",
  PLATFORM_STATUS: "e.g. server maintenance windows",
};

export function eventCategoryLabel(
  category: EventCategory,
  dict: Dictionary
): string {
  return dict.eventCategory.labels[category];
}

export function eventCategoryExample(
  category: EventCategory,
  dict: Dictionary
): string {
  return dict.eventCategory.examples[category];
}

export const EVENT_CATEGORY_ORDER: EventCategory[] = [
  "PLAYABLE",
  "SEASON_PASS",
  "ROTATION_MILESTONE",
  "COSMETIC_SHOP",
  "PLATFORM_STATUS",
];

export type RotationFilter = "limited" | "permanent";

export const ROTATION_FILTER_LABELS: Record<RotationFilter, string> = {
  limited: "Limited Time",
  permanent: "Permanent",
};

export function rotationFilterLabel(
  rotation: RotationFilter,
  dict: Dictionary
): string {
  return dict.eventCategory.rotationLabels[rotation];
}

export const ROTATION_FILTER_ORDER: RotationFilter[] = [
  "limited",
  "permanent",
];

export function matchesRotationFilter(
  isLimitedTime: boolean,
  selected: Set<RotationFilter>
): boolean {
  return selected.has(isLimitedTime ? "limited" : "permanent");
}
