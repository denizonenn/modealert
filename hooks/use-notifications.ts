import useSWR from "swr"

interface Notification {
  id: string

  userId: string

  eventId: string

  title: string

  message: string

  channel: string

  read: boolean

  createdAt: string
}

const fetcher = async (
  url: string
): Promise<Notification[]> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch notifications")
  }

  return response.json()
}

export function useNotifications(userId = "demo") {
  const { data, error, isLoading, mutate } = useSWR<
    Notification[]
  >(`/api/notifications?userId=${userId}`, fetcher)

  const notifications = data ?? []
  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length

  async function markRead(id: string) {
    await mutate(
      async () => {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        })

        return fetcher(
          `/api/notifications?userId=${userId}`
        )
      },
      {
        optimisticData: notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        rollbackOnError: true,
        revalidate: false,
      }
    )
  }

  async function markAllRead() {
    await mutate(
      async () => {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        return fetcher(
          `/api/notifications?userId=${userId}`
        )
      },
      {
        optimisticData: notifications.map((n) => ({
          ...n,
          read: true,
        })),
        rollbackOnError: true,
        revalidate: false,
      }
    )
  }

  return {
    notifications,
    unreadCount,
    error,
    isLoading,
    markRead,
    markAllRead,
  }
}
