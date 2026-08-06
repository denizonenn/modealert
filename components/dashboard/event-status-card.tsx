"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

import { GameIcon } from "@/components/shared/game-icon"
import { EventStatusBadge } from "@/components/shared/event-status-badge"

import { cn, formatRelativeTime } from "@/lib/utils"

import type { EventStatus } from "@/types/status"

interface Props {
  game: {
    id: string
    name: string
    logo: string
    color: string
  }
  event: string
  description?: string | null
  status: EventStatus
  updatedAt: string
  index?: number
  isWatched?: boolean
  onToggleWatch?: () => Promise<void> | void
}

export default function EventStatusCard({
  game,
  event,
  description,
  status,
  updatedAt,
  index = 0,
  isWatched,
  onToggleWatch,
}: Props) {
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    if (!onToggleWatch || pending) {
      return
    }

    setPending(true)

    try {
      await onToggleWatch()
    } finally {
      setPending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.03, 0.3),
      }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20"
    >
      <div className="flex min-w-0 items-center gap-4">
        <GameIcon
          gameId={game.id}
          logo={game.logo}
          color={game.color}
          size="sm"
        />

        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-500">
            {game.name}
          </p>

          <h3
            className="truncate font-semibold"
            title={description ?? undefined}
          >
            {event}
          </h3>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-xs text-zinc-500 sm:inline">
          {formatRelativeTime(updatedAt)}
        </span>

        <EventStatusBadge status={status} />

        {onToggleWatch && (
          <button
            type="button"
            onClick={handleToggle}
            disabled={pending}
            aria-label={
              isWatched
                ? "Remove from watchlist"
                : "Add to watchlist"
            }
            aria-pressed={isWatched}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50",
              isWatched
                ? "border-amber-400/30 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                : "border-white/10 bg-black/30 text-zinc-500 hover:border-white/20 hover:text-white"
            )}
          >
            <Star
              className="h-4 w-4"
              fill={isWatched ? "currentColor" : "none"}
            />
          </button>
        )}
      </div>
    </motion.div>
  )
}
