"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { Game } from "@/types/game"
import { GameIcon } from "@/components/shared/game-icon"
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"

interface Props {
  game: Game
  index?: number
}

export default function GameCard({
  game,
  index = 0,
}: Props) {
  const isLive = GAMES_WITH_PROVIDER.has(game.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="block"
    >
    <Link
      href={`/games/${game.slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20 ${
        isLive ? "" : "opacity-60"
      }`}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: game.color }}
      />

      <div className="relative flex items-center gap-4">
        <GameIcon
          gameId={game.id}
          logo={game.logo}
          color={game.color}
          size="lg"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {game.name}
          </h3>

          <p className="text-sm text-zinc-400">
            {isLive
              ? `${game.supportedEvents} supported event${
                  game.supportedEvents === 1 ? "" : "s"
                }`
              : "Tracking coming soon"}
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        {isLive ? (
          <div>
            <div className="text-xl font-bold">
              {game.activeUsers}
            </div>
            <div className="text-xs text-zinc-500">
              {game.activeUsers === "1" ? "player tracking" : "players tracking"}
            </div>
          </div>
        ) : (
          <div className="text-xs text-zinc-500">
            No live provider yet
          </div>
        )}

        <div
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${game.color}22`,
            color: game.color,
          }}
        >
          {game.shortName}
        </div>
      </div>
    </Link>
    </motion.div>
  )
}
