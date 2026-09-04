import { useState } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { useSession } from "next-auth/react"

interface GameWatchlistEntry {
  id: string
  userId: string
  gameId: string
  emailEnabled?: boolean
  discordEnabled?: boolean
}

const fetcher = async (url: string): Promise<GameWatchlistEntry[]> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch followed games")
  }

  return response.json()
}

export function useGameWatchlist() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  const { data, error, isLoading, mutate } = useSWR<GameWatchlistEntry[]>(
    isAuthed ? "/api/game-watchlists" : null,
    fetcher
  )

  const entries = data ?? []
  const followedGameIds = new Set(entries.map((entry) => entry.gameId))
  const channelsByGameId = new Map(
    entries.map((entry) => [
      entry.gameId,
      {
        emailEnabled: entry.emailEnabled ?? true,
        discordEnabled: entry.discordEnabled ?? true,
      },
    ])
  )

  const [premiumRequired, setPremiumRequired] = useState(false)

  async function toggle(gameId: string) {
    const add = !followedGameIds.has(gameId)

    const optimistic = add
      ? [...entries, { id: gameId, userId: "", gameId }]
      : entries.filter((entry) => entry.gameId !== gameId)

    let hitPremiumWall = false

    await mutate(
      async () => {
        const response = await fetch("/api/game-watchlists", {
          method: add ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId }),
        })

        if (add && response.status === 402) {
          hitPremiumWall = true
        }

        return fetcher("/api/game-watchlists")
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    )

    setPremiumRequired(hitPremiumWall)

    void globalMutate("/api/dashboard")
  }

  async function setChannels(
    gameId: string,
    channels: { emailEnabled?: boolean; discordEnabled?: boolean }
  ) {
    const optimistic = entries.map((entry) =>
      entry.gameId === gameId ? { ...entry, ...channels } : entry
    )

    await mutate(
      async () => {
        await fetch("/api/game-watchlists", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, ...channels }),
        })

        return fetcher("/api/game-watchlists")
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    )
  }

  return {
    followedGameIds,
    channelsByGameId,
    isLoading,
    error,
    premiumRequired,
    toggle,
    setChannels,
  }
}
