"use client"

import { cn } from "@/lib/utils"

import {
  ROTATION_FILTER_ORDER,
  rotationFilterLabel,
  type RotationFilter,
} from "@/lib/constants/event-category"

import { useI18n } from "@/components/providers/i18n-provider"

interface Props {
  selected: Set<RotationFilter>
  onToggle: (rotation: RotationFilter) => void
}

export function RotationFilterBar({ selected, onToggle }: Props) {
  const { dict } = useI18n()

  return (
    <div className="flex flex-wrap gap-2">
      {ROTATION_FILTER_ORDER.map((rotation) => {
        const active = selected.has(rotation)

        return (
          <button
            key={rotation}
            type="button"
            onClick={() => onToggle(rotation)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
            )}
          >
            {rotationFilterLabel(rotation, dict)}
          </button>
        )
      })}
    </div>
  )
}
