"use client"

import { useMemo, useState } from "react"

import EventStatusCard from "./event-status-card"

import { GameIcon } from "@/components/shared/game-icon"
import { cn } from "@/lib/utils"

import { useEvents } from "@/hooks/use-events"
import { useWatchlist } from "@/hooks/use-watchlist"
import { Skeleton } from "@/components/shared/skeleton"

import type { EventWithGame } from "@/lib/repositories/event.repository"
import type { EventStatus } from "@/types/status"

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

const ENDED_DISPLAY_LIMIT = 6

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
        const items = events.filter(
          (event) => event.status === status
        )

        if (items.length === 0) {
          return null
        }

        const visible =
          status === "ENDED"
            ? items.slice(0, ENDED_DISPLAY_LIMIT)
            : items

        const hiddenCount =
          items.length - visible.length

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
              {visible.map((event, index) => (
                <EventStatusCard
                  key={event.id}
                  game={event.game}
                  event={event.title}
                  description={event.description}
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

            {hiddenCount > 0 && (
              <p className="mt-3 text-sm text-zinc-600">
                +{hiddenCount} more
              </p>
            )}
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

  const watchedEvents = filteredEvents.filter((event) =>
    watchlistedIds.has(event.id)
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

          <EventSections
            events={filteredEvents}
            watchlistedIds={watchlistedIds}
            onToggleWatch={toggle}
            emptyMessage={
              selectedGameId
                ? "No events tracked yet for this game."
                : "No events tracked yet."
            }
          />
        </div>
      </div>
    </div>
  )
}
