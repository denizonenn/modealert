"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SyncResult {
  provider: string
  received?: number
  saved?: number
  skipped?: boolean
  error?: string
}

interface SyncResponse {
  success: boolean
  results?: SyncResult[]
  error?: string
}

export function ManualSyncPanel() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [response, setResponse] = useState<SyncResponse | null>(null)

  async function runSync() {
    setIsSyncing(true)
    setResponse(null)

    try {
      const res = await fetch("/api/admin/sync", { method: "POST" })
      const data: SyncResponse = await res.json()
      setResponse(data)
    } catch {
      setResponse({
        success: false,
        error: "Request failed — check the network tab.",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Manual sync</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Runs every provider right now instead of waiting for the daily
            cron. Useful right after a Riot key renewal.
          </p>
        </div>

        <Button onClick={runSync} disabled={isSyncing}>
          <RefreshCw
            className={cn("h-4 w-4", isSyncing && "animate-spin")}
          />
          {isSyncing ? "Syncing…" : "Run sync"}
        </Button>
      </div>

      {response && (
        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
          {!response.success && (
            <p className="text-sm text-red-400">
              {response.error ?? "Sync failed."}
            </p>
          )}

          {response.results?.map((result) => (
            <div
              key={result.provider}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-300">{result.provider}</span>

              {result.error ? (
                <span className="text-red-400">{result.error}</span>
              ) : result.skipped ? (
                <span className="text-zinc-600">disabled</span>
              ) : (
                <span className="text-zinc-500">
                  {result.received ?? 0} received · {result.saved ?? 0} saved
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
