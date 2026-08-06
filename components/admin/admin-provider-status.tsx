"use client"

import { CheckCircle2, XCircle, MinusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/shared/skeleton"

import { useProviderHealth } from "@/hooks/use-provider-health"
import { cn } from "@/lib/utils"

function StatusIcon({ healthy }: { healthy: boolean | null }) {
  if (healthy === null) {
    return <MinusCircle className="h-4 w-4 text-zinc-500" />
  }

  return healthy ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
  ) : (
    <XCircle className="h-4 w-4 text-red-400" />
  )
}

export function AdminProviderStatus() {
  const { providers, database, checkedAt, isLoading } = useProviderHealth()

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Provider status</h3>
        {checkedAt && (
          <span className="text-xs text-zinc-600">
            checked {new Date(checkedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {isLoading &&
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}

        {database && (
          <div
            className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
              database.healthy === false
                ? "border-red-400/30 bg-red-500/5"
                : "border-white/10 bg-transparent"
            )}
          >
            <div className="flex items-center gap-2">
              <StatusIcon healthy={database.healthy} />
              <span className="text-zinc-300">Database</span>
            </div>

            <div className="flex items-center gap-2">
              {database.error && (
                <span className="max-w-xs truncate text-xs text-red-400">
                  {database.error}
                </span>
              )}

              <span className="text-xs text-zinc-500">
                {database.latencyMs}ms
              </span>

              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  database.healthy
                    ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-400"
                    : "border-red-400/30 bg-red-500/15 text-red-400"
                )}
              >
                {database.healthy ? "OK" : "Down"}
              </Badge>
            </div>
          </div>
        )}

        {providers.map((provider) => (
          <div
            key={provider.id}
            className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
              provider.healthy === false
                ? "border-red-400/30 bg-red-500/5"
                : "border-white/10 bg-transparent"
            )}
          >
            <div className="flex items-center gap-2">
              <StatusIcon healthy={provider.healthy} />
              <span className="text-zinc-300">{provider.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {provider.error && (
                <span className="max-w-xs truncate text-xs text-red-400">
                  {provider.error}
                </span>
              )}

              {provider.healthy && (
                <span className="text-xs text-zinc-500">
                  {provider.latencyMs ?? 0}ms
                </span>
              )}

              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  provider.healthy === null
                    ? "border-white/10 bg-white/5 text-zinc-500"
                    : provider.healthy
                      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-400"
                      : "border-red-400/30 bg-red-500/15 text-red-400"
                )}
              >
                {provider.healthy === null
                  ? "Disabled"
                  : provider.healthy
                    ? "OK"
                    : "Down"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
