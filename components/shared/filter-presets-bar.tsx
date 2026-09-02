"use client"

import { useState } from "react"
import { Bookmark, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useI18n } from "@/components/providers/i18n-provider"
import { useFilterPresets } from "@/hooks/use-filter-presets"

import {
  FILTER_PRESET_MAX_NAME_LENGTH,
  applyFilterPreset,
  createFilterPreset,
  type FilterPreset,
  type FilterSelection,
} from "@/lib/dashboard/filter-presets"

interface Props {
  selection: FilterSelection
  onApply: (selection: FilterSelection) => void
}

// A preset is "active" when its saved combination exactly matches the
// current filter state — normalizing both through createFilterPreset
// first so ordering/dedup rules stay in one place (lib/dashboard/
// filter-presets.ts) instead of being re-implemented here.
function isActivePreset(preset: FilterPreset, selection: FilterSelection) {
  const current = createFilterPreset(preset.name, selection)

  return (
    current.gameId === preset.gameId &&
    current.categories.join(",") === preset.categories.join(",") &&
    current.rotations.join(",") === preset.rotations.join(",")
  )
}

export function FilterPresetsBar({ selection, onApply }: Props) {
  const { dict } = useI18n()
  const { presets, save, remove } = useFilterPresets()

  const [isNaming, setIsNaming] = useState(false)
  const [name, setName] = useState("")

  if (presets.length === 0 && !isNaming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsNaming(true)}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-white/15 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-white/30 hover:text-zinc-300"
        >
          <Plus className="h-3.5 w-3.5" />
          {dict.dashboardPage.saveCurrentFilters}
        </button>
      </div>
    )
  }

  function submitSave() {
    const trimmed = name.trim()

    if (!trimmed) {
      return
    }

    save(trimmed, selection)
    setName("")
    setIsNaming(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => {
        const active = isActivePreset(preset, selection)

        return (
          <div
            key={preset.id}
            className={cn(
              "group flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-medium transition-colors",
              active
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
            )}
          >
            <button
              type="button"
              onClick={() => onApply(applyFilterPreset(preset))}
              className="flex items-center gap-1.5"
              title={dict.dashboardPage.applyFilter.replace(
                "{name}",
                preset.name
              )}
            >
              <Bookmark className="h-3 w-3 shrink-0" />
              {preset.name}
            </button>

            <button
              type="button"
              onClick={() => remove(preset.id)}
              aria-label={dict.dashboardPage.deleteFilter.replace(
                "{name}",
                preset.name
              )}
              className="rounded-full p-0.5 text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}

      {isNaming ? (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitSave()
              }

              if (e.key === "Escape") {
                setIsNaming(false)
                setName("")
              }
            }}
            maxLength={FILTER_PRESET_MAX_NAME_LENGTH}
            placeholder={dict.dashboardPage.filterNamePlaceholder}
            aria-label={dict.dashboardPage.filterNamePlaceholder}
            className="h-7 w-40 rounded-full border border-white/20 bg-white/5 px-3 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-white/40"
          />

          <button
            type="button"
            onClick={submitSave}
            disabled={!name.trim()}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {dict.dashboardPage.saveFilter}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsNaming(true)}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-white/15 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-white/30 hover:text-zinc-300"
        >
          <Plus className="h-3.5 w-3.5" />
          {dict.dashboardPage.saveCurrentFilters}
        </button>
      )}
    </div>
  )
}
