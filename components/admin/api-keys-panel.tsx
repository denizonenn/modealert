"use client"

import { useState } from "react"
import useSWR from "swr"
import { KeyRound, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ApiKeyRow {
  id: string
  name: string
  keyPrefix: string
  email: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
  usage: { used: number; limit: number }
}

const fetcher = async (url: string): Promise<{ data: ApiKeyRow[] }> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load API keys")
  return res.json()
}

export function ApiKeysPanel() {
  const { data, isLoading, mutate } = useSWR("/api/admin/api-keys", fetcher)
  const keys = data?.data ?? []

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)

  async function createKey() {
    setIsCreating(true)
    setCreateError(null)
    setRevealedKey(null)

    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error ?? "Failed to create key.")
        return
      }

      setRevealedKey(data.rawKey)
      setEmail("")
      setName("")
      await mutate()
    } catch {
      setCreateError("Request failed — check the network tab.")
    } finally {
      setIsCreating(false)
    }
  }

  async function revoke(id: string) {
    await fetch("/api/admin/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    await mutate()
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-zinc-400" />
        <h3 className="font-semibold">API keys</h3>
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        Manual-approval issuance for the public v1 API — no self-serve
        signup/billing yet. Usage is the current hour&apos;s count against
        the 300 req/hour limit `verifyApiKey()` enforces.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-white/10 pt-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500" htmlFor="api-key-email">
            Account email
          </label>
          <input
            id="api-key-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@example.com"
            className="w-56 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500" htmlFor="api-key-name">
            Key name
          </label>
          <input
            id="api-key-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Discord bot"
            className="w-48 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>

        <Button
          onClick={createKey}
          disabled={isCreating || !email || !name}
        >
          {isCreating ? "Creating…" : "Create key"}
        </Button>
      </div>

      {createError && (
        <p className="mt-2 text-sm text-red-400">{createError}</p>
      )}

      {revealedKey && (
        <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
          <p className="text-xs text-emerald-400">
            Shown once — copy it now, it can&apos;t be retrieved again:
          </p>
          <code className="mt-1 block break-all text-sm text-white">
            {revealedKey}
          </code>
        </div>
      )}

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        {isLoading && (
          <p className="text-sm text-zinc-500">Loading…</p>
        )}

        {!isLoading && keys.length === 0 && (
          <p className="text-sm text-zinc-500">No API keys issued yet.</p>
        )}

        {keys.map((key) => {
          const isRevoked = Boolean(key.revokedAt)
          const nearLimit = key.usage.used >= key.usage.limit * 0.8

          return (
            <div
              key={key.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
                isRevoked
                  ? "border-white/5 bg-transparent opacity-50"
                  : "border-white/10 bg-transparent"
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200">{key.name}</span>
                  <code className="text-xs text-zinc-500">
                    {key.keyPrefix}…
                  </code>
                </div>
                <p className="text-xs text-zinc-400">
                  {key.email} · created{" "}
                  {new Date(key.createdAt).toLocaleDateString()} · last used{" "}
                  {key.lastUsedAt
                    ? new Date(key.lastUsedAt).toLocaleString()
                    : "never"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    isRevoked
                      ? "border-white/10 bg-white/5 text-zinc-500"
                      : nearLimit
                        ? "border-amber-400/30 bg-amber-500/15 text-amber-400"
                        : "border-emerald-400/30 bg-emerald-500/15 text-emerald-400"
                  )}
                >
                  {isRevoked
                    ? "Revoked"
                    : `${key.usage.used}/${key.usage.limit} this hour`}
                </Badge>

                {!isRevoked && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revoke(key.id)}
                    title="Revoke key"
                    aria-label={`Revoke key ${key.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
