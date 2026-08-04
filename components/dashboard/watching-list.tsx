"use client"

import EventStatusCard from "./event-status-card"

import { useEvents } from "@/hooks/use-events"
import { useWatchlist } from "@/hooks/use-watchlist"
import { Skeleton } from "@/components/shared/skeleton"

import type { EventWithGame } from "@/lib/repositories/event.repository"
import type { EventStatus } from "@/types/status"

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

  const isLoading = eventsLoading || watchlistLoading

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

  const watchedEvents = events.filter((event) =>
    watchlistedIds.has(event.id)
  )

  return (
    <div className="space-y-14">
      <div>
        <h2 className="mb-6 text-lg font-semibold">
          Your Watchlist
        </h2>

        <EventSections
          events={watchedEvents}
          watchlistedIds={watchlistedIds}
          onToggleWatch={toggle}
          emptyMessage="You're not watching anything yet — add events from the list below."
        />
      </div>

      <div>
        <h2 className="mb-6 text-lg font-semibold">
          All Events
        </h2>

        <EventSections
          events={events}
          watchlistedIds={watchlistedIds}
          onToggleWatch={toggle}
          emptyMessage="No events tracked yet."
        />
      </div>
    </div>
  )
}
