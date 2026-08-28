"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import EventStatusCard from "./event-status-card"

import { GameIcon } from "@/components/shared/game-icon"
import { cn } from "@/lib/utils"

import { useEvents } from "@/hooks/use-events"
import { useWatchlist } from "@/hooks/use-watchlist"
import { useGameWatchlist } from "@/hooks/use-game-watchlist"
import { Skeleton } from "@/components/shared/skeleton"
import { collapseSeriesToLatest } from "@/lib/utils/event-series"

import type { EventWithGame } from "@/lib/repositories/event.repository"
import type { EventStatus } from "@/types/status"

import { CategoryFilterBar } from "@/components/shared/category-filter-bar"
import { RotationFilterBar } from "@/components/shared/rotation-filter-bar"
import { useI18n } from "@/components/providers/i18n-provider"

import {
  categorySortKey,
  EVENT_CATEGORIES,
  matchesRotationFilter,
  ROTATION_FILTER_ORDER,
  type EventCategory,
  type RotationFilter,
} from "@/lib/constants/event-category"
import { FREE_WATCHLIST_LIMIT } from "@/lib/constants/plan"

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
  const { dict } = useI18n()

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
        {dict.dashboardPage.allGames}
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

function getSections(
  dict: ReturnType<typeof useI18n>["dict"]
): { status: EventStatus; label: string }[] {
  return [
    { status: "LIVE", label: dict.dashboardPage.sectionLive },
    { status: "UPCOMING", label: dict.dashboardPage.sectionUpcoming },
    { status: "TRACKING", label: dict.dashboardPage.sectionTracking },
    { status: "ENDED", label: dict.dashboardPage.sectionEnded },
  ]
}

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
  const { dict } = useI18n()

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-zinc-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {getSections(dict).map(({ status, label }) => {
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
  const { dict, path } = useI18n()

  const {
    events,
    isLoading: eventsLoading,
    error,
  } = useEvents()

  const {
    watchlistedIds,
    isLoading: watchlistLoading,
    limitReached,
    toggle,
  } = useWatchlist()

  const {
    followedGameIds,
    toggle: toggleGame,
  } = useGameWatchlist()

  const [selectedGameId, setSelectedGameId] =
    useState<string | null>(null)

  const [query, setQuery] = useState("")

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

  const searchedEvents = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) {
      return events
    }

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        event.game.name.toLowerCase().includes(q)
    )
  }, [events, query])

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
        {dict.dashboardPage.failedToLoadEvents}
      </div>
    )
  }

  const filteredEvents = selectedGameId
    ? searchedEvents.filter(
        (event) => event.game.id === selectedGameId
      )
    : searchedEvents

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

  const followedGames = games.filter((game) =>
    followedGameIds.has(game.id)
  )

  return (
    <div>
      <GameFilterBar
        games={games}
        selectedGameId={selectedGameId}
        onSelect={setSelectedGameId}
      />

      <div className="mb-8 max-w-sm">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 transition-colors focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/15">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />

          <input
            type="text"
            placeholder={dict.dashboardPage.searchEvents}
            aria-label={dict.dashboardPage.searchEventsAriaLabel}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-14">
        {followedGames.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {dict.dashboardPage.followingWholeGame}
            </h2>

            <div className="flex flex-wrap gap-2">
              {followedGames.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => toggleGame(game.id)}
                  title={dict.dashboardPage.stopFollowingAllOf.replace(
                    "{game}",
                    game.name
                  )}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pr-4 pl-1.5 text-sm font-medium text-white hover:border-white/30"
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
          </div>
        )}

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {dict.dashboardPage.yourWatchlist}
            </h2>

            {limitReached && (
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400">
                {dict.dashboardPage.freePlanLimited.replace(
                  "{limit}",
                  String(FREE_WATCHLIST_LIMIT)
                )}
                <Link
                  href={path("/pricing")}
                  className="font-medium text-white hover:underline"
                >
                  {dict.dashboardPage.upgradeForUnlimited}
                </Link>
              </div>
            )}
          </div>

          <EventSections
            events={watchedEvents}
            watchlistedIds={watchlistedIds}
            onToggleWatch={toggle}
            emptyMessage={
              selectedGameId
                ? dict.dashboardPage.notWatchingGame
                : dict.dashboardPage.notWatchingAny
            }
          />
        </div>

        <div>
          <h2 className="mb-6 text-lg font-semibold">
            {dict.dashboardPage.allEvents}
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
                ? dict.dashboardPage.noEventsInCategoriesGame
                : dict.dashboardPage.noEventsInCategories
            }
          />
        </div>
      </div>
    </div>
  )
}
