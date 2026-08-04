"use client"

import { motion } from "framer-motion"

import { GameIcon } from "@/components/shared/game-icon"
import { EventStatusBadge } from "@/components/shared/event-status-badge"

import { formatRelativeTime } from "@/lib/utils"

import type { EventStatus } from "@/types/status"

interface Props {
  game: {
    id: string
    name: string
    logo: string
    color: string
  }
  event: string
  status: EventStatus
  updatedAt: string
  index?: number
}

export default function EventStatusCard({
  game,
  event,
  status,
  updatedAt,
  index = 0,
}: Props) {
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

          <h3 className="truncate font-semibold">
            {event}
          </h3>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden text-xs text-zinc-500 sm:inline">
          {formatRelativeTime(updatedAt)}
        </span>

        <EventStatusBadge status={status} />
      </div>
    </motion.div>
  )
}
