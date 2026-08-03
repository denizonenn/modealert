import useSWR from "swr";

import { Game } from "@/types/game";

const fetcher = async (
  url: string
): Promise<Game[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch games");
  }

  return response.json();
};

export function useGames() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<Game[]>(
    "/api/games",
    fetcher
  );

  return {
    games: data ?? [],
    error,
    isLoading,
    mutate,
  };
}