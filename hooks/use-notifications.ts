import useSWR from "swr"
import { useSession } from "next-auth/react"

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

export function useNotifications() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  const { data, error, isLoading, mutate } = useSWR<
    Notification[]
  >(isAuthed ? "/api/notifications" : null, fetcher)

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

        return fetcher("/api/notifications")
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
          body: JSON.stringify({}),
        })

        return fetcher("/api/notifications")
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
