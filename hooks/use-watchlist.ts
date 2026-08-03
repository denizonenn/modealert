import useSWR from "swr";

import type { EventWithGame } from "@/lib/repositories/event.repository";

const fetcher = async (
  url: string
): Promise<EventWithGame[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch watchlist");
  }

  return response.json();
};

export function useWatchlist(userId = "demo") {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<EventWithGame[]>(
    `/api/watchlists?userId=${userId}`,
    fetcher
  );

  return {
    events: data ?? [],
    error,
    isLoading,
    mutate,
  };
}