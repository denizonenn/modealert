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
// EVENT_CATEGORY_SORT_WEIGHT below, which is what actually encodes
// "a real event you'd play beats infrastructure noise, even ended."
export const EVENT_CATEGORY_PRIORITY: Record<EventCategory, number> = {
  PLAYABLE: 0,
  SEASON_PASS: 1,
  ROTATION_MILESTONE: 2,
  COSMETIC_SHOP: 3,
  PLATFORM_STATUS: 4,
};

// Multiplier applied to category priority before adding status
// priority, so category always dominates the sort — status only
// breaks ties within the same category. Must exceed the number of
// distinct status values (4).
const CATEGORY_SORT_WEIGHT = 10;

export function categorySortKey(
  category: string,
  statusPriority: number
): number {
  const categoryPriority =
    EVENT_CATEGORY_PRIORITY[category as EventCategory] ??
    EVENT_CATEGORY_PRIORITY.PLAYABLE;

  return categoryPriority * CATEGORY_SORT_WEIGHT + statusPriority;
}

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

export const EVENT_CATEGORY_ORDER: EventCategory[] = [
  "PLAYABLE",
  "SEASON_PASS",
  "ROTATION_MILESTONE",
  "COSMETIC_SHOP",
  "PLATFORM_STATUS",
];
