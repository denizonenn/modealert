import { useCallback, useSyncExternalStore } from "react"

import {
  FILTER_PRESETS_STORAGE_KEY,
  addFilterPreset,
  createFilterPreset,
  parseStoredFilterPresets,
  removeFilterPreset,
  serializeFilterPresets,
  type FilterPreset,
  type FilterSelection,
} from "@/lib/dashboard/filter-presets"

// localStorage is external, mutable state — useSyncExternalStore (not a
// state-in-effect hydration dance) is the React-recommended way to read
// it without a hydration mismatch: `getServerSnapshot` matches the SSR/
// first-paint render, then React swaps in the real client value.
function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)

  return () => window.removeEventListener("storage", onStoreChange)
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(FILTER_PRESETS_STORAGE_KEY)
  } catch {
    // Private browsing / storage disabled.
    return null
  }
}

function getServerSnapshot(): string | null {
  return null
}

export function useFilterPresets() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const presets = parseStoredFilterPresets(raw)

  const persist = useCallback((next: FilterPreset[]) => {
    try {
      window.localStorage.setItem(
        FILTER_PRESETS_STORAGE_KEY,
        serializeFilterPresets(next)
      )

      // The native "storage" event only fires in *other* tabs — dispatch
      // one manually so this tab's own subscribers (this hook included)
      // re-read and reflect the write immediately.
      window.dispatchEvent(new StorageEvent("storage"))
    } catch {
      // Best-effort — see getSnapshot above.
    }
  }, [])

  const save = useCallback(
    (name: string, selection: FilterSelection) => {
      const trimmed = name.trim()

      if (!trimmed) {
        return
      }

      persist(addFilterPreset(presets, createFilterPreset(trimmed, selection)))
    },
    [presets, persist]
  )

  const remove = useCallback(
    (id: string) => {
      persist(removeFilterPreset(presets, id))
    },
    [presets, persist]
  )

  return { presets, save, remove }
}
