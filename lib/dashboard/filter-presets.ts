import {
  EVENT_CATEGORY_ORDER,
  ROTATION_FILTER_ORDER,
  type EventCategory,
  type RotationFilter,
} from "@/lib/constants/event-category"

// Saved combination of the "All Events" filter bar's three dimensions
// (game / category / rotation). Search text is deliberately excluded —
// it's a transient lookup, not a filter someone would want to re-apply
// days later. Stored client-side only (localStorage): this is a
// per-browser convenience, not data that needs to sync across devices
// or survive a browser reset, and per CLAUDE.md's migration caution a
// speculative "nobody asked for this yet" feature earns a DB table
// only once real demand shows up.
export interface FilterPreset {
  id: string
  name: string
  gameId: string | null
  categories: EventCategory[]
  rotations: RotationFilter[]
}

export interface FilterSelection {
  gameId: string | null
  categories: Set<EventCategory>
  rotations: Set<RotationFilter>
}

const STORAGE_KEY = "modealert.dashboard.filterPresets"
const MAX_PRESETS = 20
const MAX_NAME_LENGTH = 40

function isEventCategory(value: unknown): value is EventCategory {
  return (
    typeof value === "string" &&
    (EVENT_CATEGORY_ORDER as string[]).includes(value)
  )
}

function isRotationFilter(value: unknown): value is RotationFilter {
  return (
    typeof value === "string" &&
    (ROTATION_FILTER_ORDER as string[]).includes(value)
  )
}

// Storage content is untrusted the moment it round-trips through
// `JSON.parse` — a stale shape from a future/older build, or a value a
// user hand-edited in devtools, must never crash the dashboard. Any
// entry that doesn't fully match the expected shape is dropped rather
// than rendered half-broken.
function isFilterPreset(value: unknown): value is FilterPreset {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const preset = value as Record<string, unknown>

  return (
    typeof preset.id === "string" &&
    preset.id.length > 0 &&
    typeof preset.name === "string" &&
    preset.name.length > 0 &&
    (preset.gameId === null || typeof preset.gameId === "string") &&
    Array.isArray(preset.categories) &&
    preset.categories.every(isEventCategory) &&
    Array.isArray(preset.rotations) &&
    preset.rotations.every(isRotationFilter)
  )
}

export function parseStoredFilterPresets(raw: string | null): FilterPreset[] {
  if (!raw) {
    return []
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed.filter(isFilterPreset)
}

export function serializeFilterPresets(presets: FilterPreset[]): string {
  return JSON.stringify(presets)
}

export function normalizeFilterPresetName(rawName: string): string {
  return rawName.trim().slice(0, MAX_NAME_LENGTH)
}

export function createFilterPreset(
  name: string,
  selection: FilterSelection
): FilterPreset {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: normalizeFilterPresetName(name),
    gameId: selection.gameId,
    categories: EVENT_CATEGORY_ORDER.filter((category) =>
      selection.categories.has(category)
    ),
    rotations: ROTATION_FILTER_ORDER.filter((rotation) =>
      selection.rotations.has(rotation)
    ),
  }
}

export function applyFilterPreset(preset: FilterPreset): FilterSelection {
  return {
    gameId: preset.gameId,
    categories: new Set(preset.categories),
    rotations: new Set(preset.rotations),
  }
}

// Oldest-first eviction once the cap is hit, rather than silently
// refusing to save — a user hitting the cap is far more likely to be
// experimenting with names than deliberately curating exactly 20.
export function addFilterPreset(
  presets: FilterPreset[],
  preset: FilterPreset
): FilterPreset[] {
  const next = [...presets, preset]

  return next.length > MAX_PRESETS ? next.slice(next.length - MAX_PRESETS) : next
}

export function removeFilterPreset(
  presets: FilterPreset[],
  id: string
): FilterPreset[] {
  return presets.filter((preset) => preset.id !== id)
}

export { STORAGE_KEY as FILTER_PRESETS_STORAGE_KEY, MAX_NAME_LENGTH as FILTER_PRESET_MAX_NAME_LENGTH }
