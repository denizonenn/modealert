"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Check, Lock, Plus } from "lucide-react"

import { useGameWatchlist } from "@/hooks/use-game-watchlist"

// Follows every current and future event for a game in one action —
// separate from the per-event star toggle on the dashboard. Premium-
// only (see ADR-051), so this doubles as an upsell surface for signed-
// in Free users and a signup nudge for anonymous visitors.
export function FollowGameButton({
  gameId,
  gameName,
}: {
  gameId: string
  gameName: string
}) {
  const { status } = useSession()
  const pathname = usePathname()
  const { followedGameIds, isLoading, premiumRequired, toggle } =
    useGameWatchlist()

  if (status === "unauthenticated") {
    return (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 hover:border-white/20 hover:text-white"
      >
        <Plus className="h-3.5 w-3.5" />
        Follow all of {gameName}
      </Link>
    )
  }

  if (status !== "authenticated" || isLoading) {
    return null
  }

  const isFollowing = followedGameIds.has(gameId)

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={() => toggle(gameId)}
        className={
          isFollowing
            ? "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white"
            : "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 hover:border-white/20 hover:text-white"
        }
      >
        {isFollowing ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {isFollowing ? `Following all of ${gameName}` : `Follow all of ${gameName}`}
      </button>

      {premiumRequired && !isFollowing && (
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <Lock className="h-3 w-3" />
          Following a whole game requires Premium
        </Link>
      )}
    </div>
  )
}
