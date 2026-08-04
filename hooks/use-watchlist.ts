import useSWR, { mutate as globalMutate } from "swr"

interface WatchlistEntry {
  id: string
  userId: string
  eventId: string
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

export function useWatchlist(userId = "demo") {
  const { data, error, isLoading, mutate } = useSWR<
    WatchlistEntry[]
  >(`/api/watchlists?userId=${userId}`, fetcher)

  const entries = data ?? []
  const watchlistedIds = new Set(
    entries.map((entry) => entry.eventId)
  )

  async function mutateWatchlist(
    eventId: string,
    add: boolean
  ) {
    const optimistic = add
      ? [
          ...entries,
          { id: eventId, userId, eventId },
        ]
      : entries.filter(
          (entry) => entry.eventId !== eventId
        )

    await mutate(
      async () => {
        await fetch("/api/watchlists", {
          method: add ? "POST" : "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, eventId }),
        })

        return fetcher(
          `/api/watchlists?userId=${userId}`
        )
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    )

    void globalMutate("/api/dashboard")
  }

  async function toggle(eventId: string) {
    await mutateWatchlist(
      eventId,
      !watchlistedIds.has(eventId)
    )
  }

  return {
    watchlistedIds,
    isLoading,
    error,
    toggle,
  }
}
