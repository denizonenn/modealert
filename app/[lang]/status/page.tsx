"use client"

import { CheckCircle2, XCircle, MinusCircle } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/shared/skeleton"

import { useProviderHealth } from "@/hooks/use-provider-health"
import { useI18n } from "@/components/providers/i18n-provider"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n/dictionaries"

function StatusIcon({
  healthy,
}: {
  healthy: boolean | null
}) {
  if (healthy === null) {
    return <MinusCircle className="h-5 w-5 text-zinc-500" />
  }

  return healthy ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
  ) : (
    <XCircle className="h-5 w-5 text-red-400" />
  )
}

function statusBadge(healthy: boolean | null, dict: Dictionary) {
  if (healthy === null) {
    return (
      <Badge
        variant="outline"
        className="border-white/10 bg-white/5 text-zinc-500"
      >
        {dict.statusPage.disabled}
      </Badge>
    )
  }

  return healthy ? (
    <Badge
      variant="outline"
      className="border-emerald-400/30 bg-emerald-500/15 text-emerald-400"
    >
      {dict.statusPage.operational}
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="border-red-400/30 bg-red-500/15 text-red-400"
    >
      {dict.statusPage.down}
    </Badge>
  )
}

export default function StatusPage() {
  const { dict } = useI18n()
  const { providers, database, checkedAt, isLoading, error } =
    useProviderHealth()

  const allHealthy =
    providers
      .filter((p) => p.enabled)
      .every((p) => p.healthy) &&
    database?.healthy !== false

  return (
    <>
      <Navbar />

      <main id="main-content" className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          {dict.statusPage.eyebrow}
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {isLoading
            ? dict.statusPage.checking
            : allHealthy
            ? dict.statusPage.allOperational
            : dict.statusPage.someDegraded}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">{dict.statusPage.intro}</p>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {dict.statusPage.fetchError}
          </p>
        )}

        <div className="mt-10 space-y-3">
          {isLoading &&
            [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}

          {database && (
            <div
              className={cn(
                "rounded-xl border p-4",
                database.healthy === false
                  ? "border-red-400/30 bg-red-500/5"
                  : "border-white/10 bg-white/5"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StatusIcon healthy={database.healthy} />

                  <div>
                    <p className="font-medium">{dict.statusPage.database}</p>

                    <p className="text-xs text-zinc-500">
                      {database.latencyMs}ms
                    </p>

                    {database.error && (
                      <p className="mt-1 text-xs text-red-400">
                        {database.error}
                      </p>
                    )}
                  </div>
                </div>

                {statusBadge(database.healthy, dict)}
              </div>
            </div>
          )}

          {providers.map((provider) => (
            <div
              key={provider.id}
              className={cn(
                "rounded-xl border p-4",
                provider.healthy === false
                  ? "border-red-400/30 bg-red-500/5"
                  : "border-white/10 bg-white/5"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StatusIcon healthy={provider.healthy} />

                  <div>
                    <p className="font-medium">{provider.name}</p>

                    {provider.healthy && (
                      <p className="text-xs text-zinc-500">
                        {dict.statusPage.eventsLatency
                          .replace(
                            "{count}",
                            String(provider.eventCount ?? 0)
                          )
                          .replace("{ms}", String(provider.latencyMs ?? 0))}
                      </p>
                    )}

                    {provider.error && (
                      <p className="mt-1 text-xs text-red-400">
                        {provider.error}
                      </p>
                    )}
                  </div>
                </div>

                {statusBadge(provider.healthy, dict)}
              </div>
            </div>
          ))}
        </div>

        {checkedAt && (
          <p className="mt-8 text-center text-xs text-zinc-400">
            {dict.statusPage.lastChecked.replace(
              "{time}",
              new Date(checkedAt).toLocaleTimeString()
            )}
          </p>
        )}
      </main>

      <Footer />
    </>
  )
}
