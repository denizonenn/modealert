"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Lock, Mail, Trash2, Sparkles, User } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/shared/skeleton"

import { useRequireAuth } from "@/hooks/use-require-auth"
import { useTrackEvent } from "@/hooks/use-track-event"
import { PLAN_LABELS, type Plan } from "@/lib/constants/plan"
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events"

const MIN_PASSWORD_LENGTH = 8

interface Account {
  email: string
  name: string | null
  hasPassword: boolean
  emailOptOut: boolean
  plan: Plan
  subscriptionStatus: string | null
  subscriptionRenewsAt: string | null
  manageSubscriptionUrl: string | null
  checkoutUrl: string | null
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="font-semibold">{title}</h2>

      {description && (
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      )}

      <div className="mt-5">{children}</div>
    </div>
  )
}

function UpgradedBanner() {
  const searchParams = useSearchParams()

  if (searchParams.get("upgraded") !== "1") {
    return null
  }

  return (
    <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
      Payment received — activating your Premium plan. This can take a
      few seconds; refresh if your plan below doesn&apos;t update.
    </p>
  )
}

function SubscriptionSection({ account }: { account: Account }) {
  const isPremium = account.plan === "PREMIUM"
  const track = useTrackEvent()

  return (
    <Section
      title="Subscription"
      description={
        isPremium
          ? "Unlimited tracked events and per-event predictions."
          : "Upgrade for unlimited tracked events and per-event predictions."
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
          <Sparkles className="h-3.5 w-3.5" />
          {PLAN_LABELS[account.plan]}
          {isPremium && account.subscriptionRenewsAt && (
            <span className="text-zinc-500">
              · renews{" "}
              {new Date(
                account.subscriptionRenewsAt
              ).toLocaleDateString()}
            </span>
          )}
        </span>

        {isPremium ? (
          account.manageSubscriptionUrl && (
            <a
              href={account.manageSubscriptionUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Manage subscription
              </Button>
            </a>
          )
        ) : account.checkoutUrl ? (
          <a
            href={account.checkoutUrl}
            onClick={() =>
              track(ANALYTICS_EVENTS.CHECKOUT_CLICKED, "settings")
            }
          >
            <Button className="bg-gradient-brand text-white">
              Upgrade to Premium
            </Button>
          </a>
        ) : (
          <a href="/pricing">
            <Button
              variant="outline"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              See plans
            </Button>
          </a>
        )}
      </div>
    </Section>
  )
}

const MAX_NAME_LENGTH = 50

function ProfileSection({
  account,
  onUpdated,
}: {
  account: Account
  onUpdated: (name: string) => void
}) {
  const { update } = useSession()

  const [name, setName] = useState(account.name ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError(null)
    setSuccess(false)

    const trimmed = name.trim()

    if (trimmed.length === 0) {
      setError("Display name can't be empty.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.")
        return
      }

      // Session strategy is JWT — without this, the navbar/dropdown
      // would keep showing the old name until the next full sign-in.
      await update({ name: trimmed })

      setSuccess(true)
      onUpdated(trimmed)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section
      title="Profile"
      description="The display name shown in the navbar and on notifications."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
          <User className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            type="text"
            required
            maxLength={MAX_NAME_LENGTH}
            placeholder="Display name"
            aria-label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-400">Display name updated.</p>
        )}

        <Button
          type="submit"
          disabled={submitting || name.trim() === (account.name ?? "")}
          className="mt-1 w-fit bg-white text-black hover:bg-zinc-200"
        >
          {submitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Section>
  )
}

function PasswordSection({
  account,
  onUpdated,
}: {
  account: Account
  onUpdated: () => void
}) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError(null)
    setSuccess(false)

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: account.hasPassword
            ? currentPassword
            : undefined,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.")
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess(true)
      onUpdated()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section
      title={account.hasPassword ? "Change password" : "Set a password"}
      description={
        account.hasPassword
          ? "Update the password you use to sign in with email."
          : "You signed up without a password. Set one to also be able to sign in with email + password."
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {account.hasPassword && (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
            <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              type="password"
              required
              placeholder="Current password"
              aria-label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
          <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            type="password"
            required
            placeholder="New password (min. 8 characters)"
            aria-label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
          <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            type="password"
            required
            placeholder="Confirm new password"
            aria-label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-400">
            Password {account.hasPassword ? "updated" : "set"}.
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="mt-1 w-fit bg-white text-black hover:bg-zinc-200"
        >
          {submitting
            ? "Saving..."
            : account.hasPassword
            ? "Update password"
            : "Set password"}
        </Button>
      </form>
    </Section>
  )
}

function NotificationsSection({
  account,
  onUpdated,
}: {
  account: Account
  onUpdated: (emailOptOut: boolean) => void
}) {
  const [saving, setSaving] = useState(false)

  async function toggle(checked: boolean) {
    setSaving(true)

    const emailOptOut = !checked

    try {
      await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOptOut }),
      })

      onUpdated(emailOptOut)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section
      title="Email notifications"
      description="Turn off to stop receiving event emails. Your watchlist stays intact."
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-300">
          {account.emailOptOut
            ? "Currently off — you won't get event emails."
            : "Currently on — you'll get event emails."}
        </span>

        <Switch
          checked={!account.emailOptOut}
          onCheckedChange={toggle}
          disabled={saving}
        />
      </div>
    </Section>
  )
}

function DangerZone() {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)

    try {
      await fetch("/api/account", { method: "DELETE" })
      await signOut({ callbackUrl: "/" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Section
      title="Delete account"
      description="Permanently deletes your account, watchlist, and notification history. This can't be undone."
    >
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-red-400">Are you sure?</p>

          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting..." : "Yes, delete my account"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete account
        </Button>
      )}
    </Section>
  )
}

export default function SettingsPage() {
  const authStatus = useRequireAuth()

  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authStatus !== "authenticated") return

    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => setAccount(data))
      .finally(() => setLoading(false))
  }, [authStatus])

  if (authStatus !== "authenticated") {
    return (
      <>
        <Navbar />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Account
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Settings
        </h1>

        <Suspense fallback={null}>
          <UpgradedBanner />
        </Suspense>

        {loading || !account ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <Section title="Email">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Mail className="h-4 w-4 text-zinc-500" />
                {account.email}
              </div>
            </Section>

            <SubscriptionSection account={account} />

            <ProfileSection
              account={account}
              onUpdated={(name) =>
                setAccount((prev) => (prev ? { ...prev, name } : prev))
              }
            />

            <PasswordSection
              account={account}
              onUpdated={() =>
                setAccount((prev) =>
                  prev ? { ...prev, hasPassword: true } : prev
                )
              }
            />

            <NotificationsSection
              account={account}
              onUpdated={(emailOptOut) =>
                setAccount((prev) =>
                  prev ? { ...prev, emailOptOut } : prev
                )
              }
            />

            <DangerZone />
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
