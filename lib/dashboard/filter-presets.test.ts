import { describe, expect, it } from "vitest"

import {
  addFilterPreset,
  applyFilterPreset,
  createFilterPreset,
  normalizeFilterPresetName,
  parseStoredFilterPresets,
  removeFilterPreset,
  serializeFilterPresets,
  type FilterPreset,
} from "./filter-presets"

describe("createFilterPreset / applyFilterPreset", () => {
  it("round-trips a selection through a preset", () => {
    const selection = {
      gameId: "lol",
      categories: new Set<"PLAYABLE" | "COSMETIC_SHOP">([
        "PLAYABLE",
        "COSMETIC_SHOP",
      ]),
      rotations: new Set<"limited" | "permanent">(["limited"]),
    }

    const preset = createFilterPreset("  My Filter  ", selection)

    expect(preset.name).toBe("My Filter")
    expect(preset.gameId).toBe("lol")
    expect(preset.categories).toEqual(["PLAYABLE", "COSMETIC_SHOP"])
    expect(preset.rotations).toEqual(["limited"])
    expect(preset.id.length).toBeGreaterThan(0)

    const restored = applyFilterPreset(preset)

    expect(restored.gameId).toBe("lol")
    expect(restored.categories).toEqual(selection.categories)
    expect(restored.rotations).toEqual(selection.rotations)
  })

  it("stores categories/rotations in canonical order regardless of selection order", () => {
    const preset = createFilterPreset("order", {
      gameId: null,
      categories: new Set<"COSMETIC_SHOP" | "PLAYABLE">([
        "COSMETIC_SHOP",
        "PLAYABLE",
      ]),
      rotations: new Set<"permanent" | "limited">(["permanent", "limited"]),
    })

    expect(preset.categories).toEqual(["PLAYABLE", "COSMETIC_SHOP"])
    expect(preset.rotations).toEqual(["limited", "permanent"])
  })
})

describe("normalizeFilterPresetName", () => {
  it("trims whitespace and caps length", () => {
    expect(normalizeFilterPresetName("  hi  ")).toBe("hi")
    expect(normalizeFilterPresetName("x".repeat(100)).length).toBe(40)
  })
})

describe("parseStoredFilterPresets", () => {
  it("returns an empty list for missing/invalid storage", () => {
    expect(parseStoredFilterPresets(null)).toEqual([])
    expect(parseStoredFilterPresets("not json")).toEqual([])
    expect(parseStoredFilterPresets("{}")).toEqual([])
    expect(parseStoredFilterPresets("[1, 2, 3]")).toEqual([])
  })

  it("round-trips well-formed presets through serialize/parse", () => {
    const presets: FilterPreset[] = [
      {
        id: "a",
        name: "Ranked only",
        gameId: "lol",
        categories: ["PLAYABLE"],
        rotations: ["limited", "permanent"],
      },
    ]

    expect(parseStoredFilterPresets(serializeFilterPresets(presets))).toEqual(
      presets
    )
  })

  it("drops individually malformed entries instead of discarding the whole list", () => {
    const raw = JSON.stringify([
      {
        id: "a",
        name: "Valid",
        gameId: null,
        categories: ["PLAYABLE"],
        rotations: ["limited"],
      },
      { id: "b", name: "", gameId: null, categories: [], rotations: [] },
      {
        id: "c",
        name: "Bad category",
        gameId: null,
        categories: ["NOT_REAL"],
        rotations: ["limited"],
      },
      "not an object",
    ])

    const parsed = parseStoredFilterPresets(raw)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].id).toBe("a")
  })
})

describe("addFilterPreset / removeFilterPreset", () => {
  const preset = (id: string): FilterPreset => ({
    id,
    name: id,
    gameId: null,
    categories: ["PLAYABLE"],
    rotations: ["limited"],
  })

  it("appends a preset", () => {
    const result = addFilterPreset([preset("a")], preset("b"))

    expect(result.map((p) => p.id)).toEqual(["a", "b"])
  })

  it("evicts the oldest preset once the cap is exceeded", () => {
    const existing = Array.from({ length: 20 }, (_, i) => preset(`p${i}`))

    const result = addFilterPreset(existing, preset("new"))

    expect(result).toHaveLength(20)
    expect(result[0].id).toBe("p1")
    expect(result.at(-1)?.id).toBe("new")
  })

  it("removes a preset by id", () => {
    const result = removeFilterPreset([preset("a"), preset("b")], "a")

    expect(result.map((p) => p.id)).toEqual(["b"])
  })
})
