"use client"

import { useState } from "react"
import useSWR from "swr"
import { KeyRound, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n/dictionaries"

interface ApiKeyRow {
  id: string
  name: string
  keyPrefix: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
  usage: { used: number; limit: number }
}

const fetcher = async (
  url: string
): Promise<{ data: ApiKeyRow[]; limit: number }> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load API keys")
  return res.json()
}

// Self-serve counterpart to components/admin/api-keys-panel.tsx —
// same interaction pattern, scoped to the signed-in user's own keys
// via /api/keys instead of the admin-only /api/admin/api-keys. See
// docs/06_DECISIONS.md ADR-067 / docs/09_BACKLOG.md "Sellable API".
export function ApiKeysSection({ dict }: { dict: Dictionary }) {
  const t = dict.settingsPage
  const { data, isLoading, mutate } = useSWR("/api/keys", fetcher)
  const keys = data?.data ?? []
  const activeCount = keys.filter((k) => !k.revokedAt).length
  const atLimit = data ? activeCount >= data.limit : false

  const [name, setName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [confirmingRevokeId, setConfirmingRevokeId] = useState<
    string | null
  >(null)

  async function createKey() {
    setIsCreating(true)
    setCreateError(null)
    setRevealedKey(null)

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const body = await res.json()

      if (!res.ok) {
        setCreateError(body.error ?? dict.common.somethingWentWrong)
        return
      }

      setRevealedKey(body.rawKey)
      setName("")
      await mutate()
    } catch {
      setCreateError(dict.common.somethingWentWrong)
    } finally {
      setIsCreating(false)
    }
  }

  async function revoke(id: string) {
    setConfirmingRevokeId(null)
    await fetch(`/api/keys/${id}`, { method: "DELETE" })
    await mutate()
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-zinc-400" />
        <h2 className="font-semibold">{t.apiKeysTitle}</h2>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{t.apiKeysDesc}</p>

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-white/10 pt-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500" htmlFor="api-key-name">
            {t.apiKeyNameLabel}
          </label>
          <input
            id="api-key-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.apiKeyNamePlaceholder}
            disabled={atLimit}
            className="w-56 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
          />
        </div>

        <Button
          onClick={createKey}
          disabled={isCreating || !name.trim() || atLimit}
        >
          {isCreating ? t.creatingApiKey : t.createApiKey}
        </Button>
      </div>

      {atLimit && (
        <p className="mt-2 text-sm text-amber-400">{t.apiKeyLimitReached}</p>
      )}
      {createError && (
        <p className="mt-2 text-sm text-red-400">{createError}</p>
      )}

      {revealedKey && (
        <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
          <p className="text-xs text-emerald-400">{t.revealedKeyNotice}</p>
          <code className="mt-1 block break-all text-sm text-white">
            {revealedKey}
          </code>
        </div>
      )}

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        {isLoading && (
          <p className="text-sm text-zinc-500">{dict.common.loading}</p>
        )}

        {!isLoading && keys.length === 0 && (
          <p className="text-sm text-zinc-500">{t.noApiKeysYet}</p>
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
                  {new Date(key.createdAt).toLocaleDateString()}
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
                    ? t.apiKeyRevoked
                    : `${key.usage.used}/${key.usage.limit}`}
                </Badge>

                {!isRevoked &&
                  (confirmingRevokeId === key.id ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revoke(key.id)}
                      >
                        {t.revokeApiKeyConfirm}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmingRevokeId(null)}
                      >
                        {dict.common.cancel}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmingRevokeId(key.id)}
                      title={t.revokeApiKey}
                      aria-label={`${t.revokeApiKey} ${key.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
