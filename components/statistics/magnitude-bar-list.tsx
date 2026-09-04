"use client"

import { useState } from "react"
import Link from "next/link"

export interface MagnitudeBarItem {
  key: string
  label: string
  sublabel?: string
  href?: string
  value: number
  valueLabel: string
}

// Single series (one hue, no legend needed) — magnitude bars for a
// ranked real-data list. Brand purple, matches the sequential ramp's
// brightest step used elsewhere on this page.
const FILL = "#a855f7"

export function MagnitudeBarList({ items }: { items: MagnitudeBarItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const maxValue = Math.max(1, ...items.map((item) => item.value))

  return (
    <div className="mt-4 space-y-2">
      {items.map((item) => {
        const widthPercent = Math.max(
          4,
          Math.round((item.value / maxValue) * 100)
        )

        const label = item.href ? (
          <Link
            href={item.href}
            className="truncate font-medium hover:text-zinc-300"
          >
            {item.label}
          </Link>
        ) : (
          <span className="truncate font-medium text-zinc-200">
            {item.label}
          </span>
        )

        return (
          <div
            key={item.key}
            role="group"
            aria-label={`${item.label}: ${item.valueLabel}`}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(item.key)}
            onBlur={() => setHovered(null)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {label}
                {item.sublabel && (
                  <>
                    <span className="shrink-0 text-zinc-400">·</span>
                    <span className="shrink-0 text-zinc-500">
                      {item.sublabel}
                    </span>
                  </>
                )}
              </div>

              <span className="shrink-0 text-xs text-zinc-500">
                {item.valueLabel}
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-[width,opacity] duration-200"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: FILL,
                  opacity: hovered === null || hovered === item.key ? 1 : 0.5,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MagnitudeBarList
