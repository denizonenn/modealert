import useSWR from "swr";

interface Notification {
  id: string;

  userId: string;

  eventId: string;

  title: string;

  message: string;

  channel: string;

  read: boolean;

  createdAt: string;
}

const fetcher = async (
  url: string
): Promise<Notification[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
};

export function useNotifications(
  userId = "demo"
) {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<Notification[]>(
    `/api/notifications?userId=${userId}`,
    fetcher
  );

  return {
    notifications: data ?? [],
    unreadCount:
      data?.filter((n) => !n.read).length ?? 0,
    error,
    isLoading,
    mutate,
  };
}