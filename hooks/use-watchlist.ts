import { useState } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { useSession } from "next-auth/react"

import { useTrackEvent } from "@/hooks/use-track-event"
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events"

interface WatchlistEntry {
  id: string
  userId: string
  eventId: string
  emailEnabled?: boolean
  discordEnabled?: boolean
}

const fetcher = async (
  url: string
): Promise<WatchlistEntry[]> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch watchlist")
  }

  return response.json()
}

export function useWatchlist() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"
  const track = useTrackEvent()

  const { data, error, isLoading, mutate } = useSWR<
    WatchlistEntry[]
  >(isAuthed ? "/api/watchlists" : null, fetcher)

  const entries = data ?? []
  const watchlistedIds = new Set(
    entries.map((entry) => entry.eventId)
  )
  const channelsByEventId = new Map(
    entries.map((entry) => [
      entry.eventId,
      {
        emailEnabled: entry.emailEnabled ?? true,
        discordEnabled: entry.discordEnabled ?? true,
      },
    ])
  )

  const [limitReached, setLimitReached] = useState(false)

  async function mutateWatchlist(
    eventId: string,
    add: boolean
  ) {
    const optimistic = add
      ? [
          ...entries,
          { id: eventId, userId: "", eventId },
        ]
      : entries.filter(
          (entry) => entry.eventId !== eventId
        )

    let hitLimit = false

    await mutate(
      async () => {
        const response = await fetch("/api/watchlists", {
          method: add ? "POST" : "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ eventId }),
        })

        // Re-fetching the real watchlist below already "rolls back"
        // the optimistic add when this happens — the failed row just
        // isn't in the real response.
        if (add && response.status === 402) {
          hitLimit = true
        }

        return fetcher("/api/watchlists")
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    )

    if (hitLimit) {
      track(ANALYTICS_EVENTS.WATCHLIST_LIMIT_HIT, "dashboard")
    }

    setLimitReached(hitLimit)

    void globalMutate("/api/dashboard")
  }

  async function toggle(eventId: string) {
    await mutateWatchlist(
      eventId,
      !watchlistedIds.has(eventId)
    )
  }

  async function setChannels(
    eventId: string,
    channels: { emailEnabled?: boolean; discordEnabled?: boolean }
  ) {
    const optimistic = entries.map((entry) =>
      entry.eventId === eventId ? { ...entry, ...channels } : entry
    )

    await mutate(
      async () => {
        await fetch("/api/watchlists", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, ...channels }),
        })

        return fetcher("/api/watchlists")
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    )
  }

  return {
    watchlistedIds,
    channelsByEventId,
    isLoading,
    error,
    limitReached,
    toggle,
    setChannels,
  }
}
