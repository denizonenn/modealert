"use client"

import { cn } from "@/lib/utils"

import {
  EVENT_CATEGORY_EXAMPLES,
  EVENT_CATEGORY_LABELS,
  EVENT_CATEGORY_ORDER,
  type EventCategory,
} from "@/lib/constants/event-category"

interface Props {
  selected: Set<EventCategory>
  onToggle: (category: EventCategory) => void
}

export function CategoryFilterBar({ selected, onToggle }: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {EVENT_CATEGORY_ORDER.map((category) => {
        const active = selected.has(category)

        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition-colors",
              active
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
            )}
          >
            <p className="text-sm font-semibold">
              {EVENT_CATEGORY_LABELS[category]}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {EVENT_CATEGORY_EXAMPLES[category]}
            </p>
          </button>
        )
      })}
    </div>
  )
}
