"use client"

import { useMemo, useState } from "react"

import EventStatusCard from "./event-status-card"

import { GameIcon } from "@/components/shared/game-icon"
import { cn } from "@/lib/utils"

import { useEvents } from "@/hooks/use-events"
import { useWatchlist } from "@/hooks/use-watchlist"
import { Skeleton } from "@/components/shared/skeleton"
import { collapseSeriesToLatest } from "@/lib/utils/event-series"

import type { EventWithGame } from "@/lib/repositories/event.repository"
import type { EventStatus } from "@/types/status"

import { CategoryFilterBar } from "@/components/shared/category-filter-bar"
import { RotationFilterBar } from "@/components/shared/rotation-filter-bar"

import {
  categorySortKey,
  EVENT_CATEGORIES,
  matchesRotationFilter,
  ROTATION_FILTER_ORDER,
  type EventCategory,
  type RotationFilter,
} from "@/lib/constants/event-category"

interface GameOption {
  id: string
  name: string
  logo: string
  color: string
}

function GameFilterBar({
  games,
  selectedGameId,
  onSelect,
}: {
  games: GameOption[]
  selectedGameId: string | null
  onSelect: (gameId: string | null) => void
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
          selectedGameId === null
            ? "border-white/20 bg-white/10 text-white"
            : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
        )}
      >
        All Games
      </button>

      {games.map((game) => (
        <button
          key={game.id}
          type="button"
          onClick={() => onSelect(game.id)}
          className={cn(
            "flex items-center gap-2 rounded-full border py-1 pr-4 pl-1.5 text-sm font-medium transition-colors",
            selectedGameId === game.id
              ? "border-white/20 bg-white/10 text-white"
              : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
          )}
        >
          <GameIcon
            gameId={game.id}
            logo={game.logo}
            color={game.color}
            size="sm"
          />
          {game.name}
        </button>
      ))}
    </div>
  )
}

const SECTIONS: {
  status: EventStatus
  label: string
}[] = [
  { status: "LIVE", label: "Live Now" },
  { status: "UPCOMING", label: "Upcoming" },
  { status: "TRACKING", label: "Tracking" },
  { status: "ENDED", label: "Recently Ended" },
]

// Default "All Events" to just the real played category — everything
// else is opt-in via the filter bar. Matches onboarding's default.
const DEFAULT_CATEGORIES: Set<EventCategory> = new Set([
  EVENT_CATEGORIES.PLAYABLE,
])

const DEFAULT_ROTATIONS: Set<RotationFilter> = new Set(
  ROTATION_FILTER_ORDER
)

function EventSections({
  events,
  watchlistedIds,
  onToggleWatch,
  emptyMessage,
}: {
  events: EventWithGame[]
  watchlistedIds: Set<string>
  onToggleWatch: (eventId: string) => Promise<void>
  emptyMessage: string
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-zinc-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {SECTIONS.map(({ status, label }) => {
        const items = events
          .filter((event) => event.status === status)
          .sort(
            (a, b) =>
              categorySortKey(a.category, a.isLimitedTime, 0) -
              categorySortKey(b.category, b.isLimitedTime, 0)
          )

        if (items.length === 0) {
          return null
        }

        return (
          <div key={status}>
            <div className="mb-4 flex items-baseline gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {label}
              </h3>

              <span className="text-sm text-zinc-600">
                {items.length}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((event, index) => (
                <EventStatusCard
                  key={event.id}
                  game={event.game}
                  event={event.title}
                  description={event.description}
                  category={event.category}
                  isLimitedTime={event.isLimitedTime}
                  slug={event.slug}
                  status={
                    event.status as EventStatus
                  }
                  updatedAt={event.lastChecked.toString()}
                  index={index}
                  isWatched={watchlistedIds.has(
                    event.id
                  )}
                  onToggleWatch={() =>
                    onToggleWatch(event.id)
                  }
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function WatchingList() {
  const {
    events,
    isLoading: eventsLoading,
    error,
  } = useEvents()

  const {
    watchlistedIds,
    isLoading: watchlistLoading,
    toggle,
  } = useWatchlist()

  const [selectedGameId, setSelectedGameId] =
    useState<string | null>(null)

  const [selectedCategories, setSelectedCategories] = useState<
    Set<EventCategory>
  >(DEFAULT_CATEGORIES)

  const [selectedRotations, setSelectedRotations] = useState<
    Set<RotationFilter>
  >(DEFAULT_ROTATIONS)

  function toggleCategory(category: EventCategory) {
    setSelectedCategories((current) => {
      const next = new Set(current)

      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }

      return next.size === 0 ? new Set([EVENT_CATEGORIES.PLAYABLE]) : next
    })
  }

  function toggleRotation(rotation: RotationFilter) {
    setSelectedRotations((current) => {
      const next = new Set(current)

      if (next.has(rotation)) {
        next.delete(rotation)
      } else {
        next.add(rotation)
      }

      return next.size === 0 ? new Set(ROTATION_FILTER_ORDER) : next
    })
  }

  const isLoading = eventsLoading || watchlistLoading

  const games = useMemo(() => {
    const byId = new Map<string, GameOption>()

    for (const event of events) {
      if (!byId.has(event.game.id)) {
        byId.set(event.game.id, {
          id: event.game.id,
          name: event.game.name,
          logo: event.game.logo,
          color: event.game.color,
        })
      }
    }

    return [...byId.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [events])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center text-zinc-400">
        Failed to load events.
      </div>
    )
  }

  const filteredEvents = selectedGameId
    ? events.filter(
        (event) => event.game.id === selectedGameId
      )
    : events

  // "Your Watchlist" shows everything the user already chose to track,
  // regardless of category — the filter only narrows the "All Events"
  // browse list below it.
  const watchedEvents = filteredEvents.filter((event) =>
    watchlistedIds.has(event.id)
  )

  // Collapsing to one row per seriesKey only applies to the "browse
  // and pick" list — a user's existing watchlist entry (above) always
  // shows exactly what they tracked, even if a newer occurrence of
  // its series has since appeared.
  const browsableEvents = collapseSeriesToLatest(filteredEvents).filter(
    (event) =>
      selectedCategories.has(event.category as EventCategory) &&
      matchesRotationFilter(event.isLimitedTime, selectedRotations)
  )

  return (
    <div>
      <GameFilterBar
        games={games}
        selectedGameId={selectedGameId}
        onSelect={setSelectedGameId}
      />

      <div className="space-y-14">
        <div>
          <h2 className="mb-6 text-lg font-semibold">
            Your Watchlist
          </h2>

          <EventSections
            events={watchedEvents}
            watchlistedIds={watchlistedIds}
            onToggleWatch={toggle}
            emptyMessage={
              selectedGameId
                ? "You're not watching any events for this game yet."
                : "You're not watching anything yet — add events from the list below."
            }
          />
        </div>

        <div>
          <h2 className="mb-6 text-lg font-semibold">
            All Events
          </h2>

          <div className="mb-6 space-y-3">
            <CategoryFilterBar
              selected={selectedCategories}
              onToggle={toggleCategory}
            />

            <RotationFilterBar
              selected={selectedRotations}
              onToggle={toggleRotation}
            />
          </div>

          <EventSections
            events={browsableEvents}
            watchlistedIds={watchlistedIds}
            onToggleWatch={toggle}
            emptyMessage={
              selectedGameId
                ? "No events in the selected categories for this game."
                : "No events in the selected categories."
            }
          />
        </div>
      </div>
    </div>
  )
}
