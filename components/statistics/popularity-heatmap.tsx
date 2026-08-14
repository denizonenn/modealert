"use client"

import { Fragment, useRef, useState } from "react"

export interface PopularityHeatmapProps {
  games: { gameId: string; gameName: string }[]
  categories: { category: string; label: string }[]
  cells: { gameId: string; category: string; value: number }[]
  maxValue: number
}

// Sequential single-hue ramp (brand purple), dark-mode direction: low
// magnitude recedes toward the black chart surface, high magnitude is
// the brightest step — see docs/06_DECISIONS.md ADR-050.
const STEPS = [
  { fill: "rgba(168,85,247,0.08)", text: "text-zinc-500" }, // 0 — no data
  { fill: "#3b0764", text: "text-zinc-300" },
  { fill: "#6b21a8", text: "text-white" },
  { fill: "#9333ea", text: "text-white" },
  { fill: "#c084fc", text: "text-black" },
]

function bucketFor(value: number, maxValue: number) {
  if (value === 0 || maxValue === 0) return 0

  const ratio = value / maxValue

  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

export function PopularityHeatmap({
  games,
  categories,
  cells,
  maxValue,
}: PopularityHeatmapProps) {
  const [showTable, setShowTable] = useState(false)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    gameName: string
    categoryLabel: string
    value: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const cellMap = new Map(
    cells.map((cell) => [`${cell.gameId}::${cell.category}`, cell.value])
  )

  const gamesWithAny = games.filter((game) =>
    categories.some(
      (cat) => (cellMap.get(`${game.gameId}::${cat.category}`) ?? 0) > 0
    )
  )

  if (gamesWithAny.length === 0) {
    return (
      <p className="mt-4 text-sm text-zinc-500">
        No one is tracking any events yet — this fills in as real users
        build watchlists.
      </p>
    )
  }

  function showTooltipFor(
    e: React.MouseEvent | React.FocusEvent,
    gameName: string,
    categoryLabel: string,
    value: number
  ) {
    const containerRect = containerRef.current?.getBoundingClientRect()
    const cellRect = e.currentTarget.getBoundingClientRect()

    if (!containerRect) return

    setTooltip({
      x: cellRect.left - containerRect.left + cellRect.width / 2,
      y: cellRect.top - containerRect.top,
      gameName,
      categoryLabel,
      value,
    })
  }

  return (
    <div>
      <div ref={containerRef} className="relative mt-4 overflow-x-auto">
        {tooltip && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs shadow-xl"
            style={{ left: tooltip.x, top: tooltip.y - 8 }}
          >
            <p className="font-semibold text-white">
              {tooltip.value}{" "}
              {tooltip.value === 1 ? "tracker" : "trackers"}
            </p>
            <p className="mt-0.5 text-zinc-400">
              {tooltip.gameName} · {tooltip.categoryLabel}
            </p>
          </div>
        )}

        <div className="inline-block min-w-full">
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `140px repeat(${categories.length}, 40px)`,
            }}
          >
            <div />
            {categories.map((cat) => (
              <div
                key={cat.category}
                className="flex items-end justify-center pb-1 text-center text-[10px] leading-tight text-zinc-500"
                title={cat.label}
              >
                {cat.label.split(" ")[0]}
              </div>
            ))}

            {gamesWithAny.map((game) => (
              <Fragment key={game.gameId}>
                <div className="flex items-center truncate pr-2 text-xs text-zinc-400">
                  {game.gameName}
                </div>

                {categories.map((cat) => {
                  const value =
                    cellMap.get(`${game.gameId}::${cat.category}`) ?? 0
                  const step = STEPS[bucketFor(value, maxValue)]

                  return (
                    <button
                      key={`${game.gameId}-${cat.category}`}
                      type="button"
                      tabIndex={0}
                      className={`flex h-10 w-10 items-center justify-center rounded-[4px] text-[11px] font-medium transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50 ${step.text}`}
                      style={{ backgroundColor: step.fill }}
                      aria-label={`${game.gameName}, ${cat.label}: ${value} ${value === 1 ? "person tracking" : "people tracking"}`}
                      onMouseEnter={(e) =>
                        showTooltipFor(e, game.gameName, cat.label, value)
                      }
                      onMouseLeave={() => setTooltip(null)}
                      onFocus={(e) =>
                        showTooltipFor(e, game.gameName, cat.label, value)
                      }
                      onBlur={() => setTooltip(null)}
                    >
                      {value > 0 ? value : ""}
                    </button>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Fewer trackers</span>
          <div className="flex gap-[2px]">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="h-3 w-6 rounded-[2px]"
                style={{ backgroundColor: step.fill }}
              />
            ))}
          </div>
          <span>More trackers</span>
        </div>

        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs text-zinc-500 underline decoration-dotted underline-offset-2 hover:text-zinc-300"
        >
          {showTable ? "Hide table view" : "View as table"}
        </button>
      </div>

      {showTable && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-zinc-500">
                <th className="px-3 py-2 font-medium">Game</th>
                {categories.map((cat) => (
                  <th key={cat.category} className="px-3 py-2 font-medium">
                    {cat.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gamesWithAny.map((game) => (
                <tr
                  key={game.gameId}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-3 py-2 text-zinc-300">
                    {game.gameName}
                  </td>
                  {categories.map((cat) => (
                    <td key={cat.category} className="px-3 py-2 text-zinc-500">
                      {cellMap.get(`${game.gameId}::${cat.category}`) ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PopularityHeatmap
