import useSWR from "swr";

interface DashboardStats {
  watched: number;
  live: number;
  nextEvent: string;
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
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<DashboardStats>(
    "/api/dashboard",
    fetcher
  );

  return {
    stats: data,
    error,
    isLoading,
    mutate,
  };
}