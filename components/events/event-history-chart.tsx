"use client"

import { useId, useState } from "react"

export interface HistoryOccurrence {
  id: string
  startedAt: Date
  endedAt: Date | null
}

// Reuses this app's already-established colors, not the dataviz
// skill's generic reference palette: purple already means "real
// computed data" on this exact page (MagnitudeBarList), and this
// green already means "healthy/in-progress" (UptimeBars' status
// palette, EventStatusBadge's LIVE dot) — a status distinction
// (ongoing vs. completed), not two arbitrary categorical series, so
// the two never need to clear a categorical CVD-pair check against
// each other. Always paired with a text label (legend below, native
// <title> tooltip per bar) — never color alone.
const FILL_COMPLETED = "#a855f7"
const FILL_ONGOING = "#0ca30c"

const MAX_ROWS = 20
const ROW_HEIGHT = 28
const ROW_GAP = 6
const VIEW_WIDTH = 1000

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" })
}

export function formatDuration(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

export interface HistoryChartBar {
  id: string
  y: number
  x0: number
  x1: number
  barWidth: number
  isOngoing: boolean
  durationMs: number
}

export interface HistoryChartLayout {
  domainStart: number
  domainEnd: number
  chartHeight: number
  bars: HistoryChartBar[]
}

// Pure layout math, pulled out of the component so the scale/domain
// logic (the part most likely to silently break — an empty span
// dividing by zero, an ongoing occurrence not extending to "now", a
// single-occurrence event collapsing to a zero-width bar) is directly
// unit-testable without rendering anything.
export function computeHistoryChartLayout(
  occurrences: HistoryOccurrence[],
  now: number,
  maxRows: number = MAX_ROWS
): HistoryChartLayout {
  const recent = occurrences.slice(-maxRows)

  const domainStart = Math.min(...recent.map((o) => o.startedAt.getTime()))
  // Only reaches all the way to `now` when an occurrence is actually
  // ongoing (its own endedAt-or-now falls back to `now`) — an event
  // that finished its last occurrence long ago and never recurred
  // shouldn't have its chart squeeze every real bar into a sliver at
  // the left edge just to stretch the axis out to today.
  const domainEnd = Math.max(
    ...recent.map((o) => (o.endedAt ?? new Date(now)).getTime())
  )
  const domainSpan = Math.max(1, domainEnd - domainStart)

  function xFor(t: number): number {
    return ((t - domainStart) / domainSpan) * VIEW_WIDTH
  }

  const bars = recent.map((occurrence, index) => {
    const endTime = (occurrence.endedAt ?? new Date(now)).getTime()
    const x0 = xFor(occurrence.startedAt.getTime())
    const x1 = xFor(endTime)

    return {
      id: occurrence.id,
      y: index * (ROW_HEIGHT + ROW_GAP),
      x0,
      x1,
      barWidth: Math.max(6, x1 - x0),
      isOngoing: occurrence.endedAt === null,
      durationMs: endTime - occurrence.startedAt.getTime(),
    }
  })

  return {
    domainStart,
    domainEnd,
    chartHeight: recent.length * (ROW_HEIGHT + ROW_GAP) - ROW_GAP,
    bars,
  }
}

export function EventHistoryChart({
  occurrences,
  locale,
  now,
  legendCompleted,
  legendOngoing,
  chartAriaLabel,
}: {
  // Oldest first — same order the caller already sorts EventHistory
  // rows in for the text timeline below.
  occurrences: HistoryOccurrence[]
  locale: string
  // Passed down rather than read via Date.now() in here, so the whole
  // page (this chart + the text timeline's "so far" durations) shares
  // one consistent instant instead of each computing its own.
  now: number
  legendCompleted: string
  legendOngoing: string
  chartAriaLabel: string
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const gradientId = useId()

  if (occurrences.length === 0) {
    return null
  }

  // Most recent N — a daily-cadence event will accumulate far more
  // rows than fit legibly on one screen; the full detail stays
  // available in the text timeline below regardless of this cap.
  const { domainStart, domainEnd, chartHeight, bars } =
    computeHistoryChartLayout(occurrences, now)

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: FILL_COMPLETED }}
          />
          {legendCompleted}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: FILL_ONGOING }}
          />
          {legendOngoing}
        </span>
      </div>

      <svg
        role="img"
        aria-label={chartAriaLabel}
        viewBox={`0 0 ${VIEW_WIDTH} ${chartHeight}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: chartHeight }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={FILL_ONGOING} stopOpacity={0.9} />
            <stop offset="100%" stopColor={FILL_ONGOING} stopOpacity={0.45} />
          </linearGradient>
        </defs>

        {bars.map((bar) => {
          const isDimmed = hoveredId !== null && hoveredId !== bar.id
          const occurrence = occurrences.find((o) => o.id === bar.id)!

          const tooltip = bar.isOngoing
            ? `${formatDate(occurrence.startedAt, locale)} → ${legendOngoing.toLowerCase()} (${formatDuration(bar.durationMs)} so far)`
            : `${formatDate(occurrence.startedAt, locale)} → ${formatDate(occurrence.endedAt!, locale)} (${formatDuration(bar.durationMs)})`

          return (
            <g
              key={bar.id}
              onMouseEnter={() => setHoveredId(bar.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-default"
            >
              <title>{tooltip}</title>
              {/* Full-width, near-invisible hit target — the visible
                  bar itself is often too narrow to hover reliably. */}
              <rect x={0} y={bar.y} width={VIEW_WIDTH} height={ROW_HEIGHT} fill="transparent" />
              <rect
                x={bar.x0}
                y={bar.y + 4}
                width={bar.barWidth}
                height={ROW_HEIGHT - 8}
                rx={4}
                fill={bar.isOngoing ? `url(#${gradientId})` : FILL_COMPLETED}
                opacity={isDimmed ? 0.4 : 1}
                style={{ transition: "opacity 150ms" }}
              />
            </g>
          )
        })}
      </svg>

      <div className="mt-1.5 flex justify-between text-[10px] text-zinc-600">
        <span>{formatDate(new Date(domainStart), locale)}</span>
        <span>{formatDate(new Date(domainEnd), locale)}</span>
      </div>
    </div>
  )
}

export default EventHistoryChart
