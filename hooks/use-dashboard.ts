import useSWR from "swr";
import { useSession } from "next-auth/react";

interface DashboardStats {
  watched: number;
  live: number;
  nextEvent: string | null;
}

const fetcher = async (
  url: string
): Promise<DashboardStats> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard");
  }

  return response.json();
};

export function useDashboard() {
  const { status } = useSession();

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<DashboardStats>(
    status === "authenticated" ? "/api/dashboard" : null,
    fetcher
  );

  return {
    stats: data,
    error,
    isLoading,
    mutate,
  };
}