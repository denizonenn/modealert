"use client"

import { GameIcon } from "@/components/shared/game-icon"
import { EventStatusBadge } from "@/components/shared/event-status-badge"
import { Skeleton } from "@/components/shared/skeleton"

import { useEvents } from "@/hooks/use-events"
import type { EventWithGame } from "@/lib/repositories/event.repository"

type EventStatus = "LIVE" | "UPCOMING" | "TRACKING" | "ENDED"

const STATUS_ORDER: Record<EventStatus, number> = {
  LIVE: 0,
  UPCOMING: 1,
  TRACKING: 2,
  ENDED: 3,
}

interface GameGroup {
  game: EventWithGame["game"]
  events: EventWithGame[]
}

function groupByGame(events: EventWithGame[]): GameGroup[] {
  const groups = new Map<string, GameGroup>()

  for (const event of events) {
    if (event.status === "ENDED") {
      continue
    }

    const existing = groups.get(event.gameId)

    if (existing) {
      existing.events.push(event)
    } else {
      groups.set(event.gameId, { game: event.game, events: [event] })
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      events: [...group.events].sort(
        (a, b) =>
          STATUS_ORDER[a.status as EventStatus] -
          STATUS_ORDER[b.status as EventStatus]
      ),
    }))
    .sort((a, b) => {
      const aLive = a.events.filter((e) => e.status === "LIVE").length
      const bLive = b.events.filter((e) => e.status === "LIVE").length

      return bLive - aLive
    })
}

export function AllGamesStatus() {
  const { events, isLoading } = useEvents()

  const groups = groupByGame(events)

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No tracked modes right now — check back after the next sync.
      </p>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {groups.map(({ game, events: gameEvents }) => (
        <div
          key={game.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <div className="flex items-center gap-3">
            <GameIcon
              gameId={game.id}
              logo={game.logo}
              color={game.color}
              size="sm"
            />

            <h3 className="font-semibold">{game.name}</h3>
          </div>

          <div className="mt-4 space-y-2">
            {gameEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
              >
                <p className="truncate text-sm text-zinc-300">
                  {event.title}
                </p>

                <EventStatusBadge
                  status={event.status as EventStatus}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
