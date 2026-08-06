import useSWR from "swr"

interface ProviderHealth {
  id: string
  name: string
  enabled: boolean
  healthy: boolean | null
  eventCount?: number
  latencyMs?: number
  error?: string
}

interface DatabaseHealth {
  healthy: boolean
  latencyMs: number
  error?: string
}

interface ProviderHealthResponse {
  success: boolean
  providers: ProviderHealth[]
  database?: DatabaseHealth
  checkedAt: string
}

const fetcher = async (
  url: string
): Promise<ProviderHealthResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to check provider health")
  }

  return response.json()
}

export function useProviderHealth() {
  const { data, error, isLoading } = useSWR<ProviderHealthResponse>(
    "/api/providers/health",
    fetcher,
    { refreshInterval: 60_000 }
  )

  return {
    providers: data?.providers ?? [],
    database: data?.database,
    checkedAt: data?.checkedAt,
    error,
    isLoading,
  }
}
