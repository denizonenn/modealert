"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Lock, Mail, Trash2, Sparkles, User, Download } from "lucide-react"
import { SiDiscord } from "react-icons/si"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/shared/skeleton"

import { useRequireAuth } from "@/hooks/use-require-auth"
import { useI18n } from "@/components/providers/i18n-provider"
import { PLAN_LABELS, type Plan } from "@/lib/constants/plan"
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries"

const MIN_PASSWORD_LENGTH = 8

interface Account {
  email: string
  name: string | null
  hasPassword: boolean
  emailOptOut: boolean
  discordWebhookUrl: string | null
  locale: string | null
  plan: Plan
  subscriptionStatus: string | null
  subscriptionRenewsAt: string | null
  manageSubscriptionUrl: string | null
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

function UpgradedBanner({ dict }: { dict: Dictionary }) {
  const searchParams = useSearchParams()

  if (searchParams.get("upgraded") !== "1") {
    return null
  }

  return (
    <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
      {dict.settingsPage.upgradedBanner}
    </p>
  )
}

function SubscriptionSection({
  account,
  dict,
  path,
  locale,
}: {
  account: Account
  dict: Dictionary
  path: (href: string) => string
  locale: string
}) {
  const isPremium = account.plan === "PREMIUM"
  const isLifetime = account.subscriptionStatus === "lifetime"
  const t = dict.settingsPage

  return (
    <Section
      title={t.subscriptionTitle}
      description={
        isPremium ? t.subscriptionDescPremium : t.subscriptionDescFree
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
          <Sparkles className="h-3.5 w-3.5" />
          {PLAN_LABELS[account.plan]}
          {isPremium && isLifetime && (
            <span className="text-zinc-500">· {t.lifetimeAccess}</span>
          )}
          {isPremium && !isLifetime && account.subscriptionRenewsAt && (
            <span className="text-zinc-500">
              ·{" "}
              {t.renews.replace(
                "{date}",
                new Date(
                  account.subscriptionRenewsAt
                ).toLocaleDateString(locale)
              )}
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
                {t.manageSubscription}
              </Button>
            </a>
          )
        ) : (
          <a href={path("/pricing")}>
            <Button className="bg-gradient-brand text-white">
              {t.seePlans}
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
  dict,
}: {
  account: Account
  onUpdated: (name: string) => void
  dict: Dictionary
}) {
  const { update } = useSession()
  const t = dict.settingsPage

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
      setError(t.displayNameEmpty)
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
        setError(data.error ?? dict.common.somethingWentWrong)
        return
      }

      // Session strategy is JWT — without this, the navbar/dropdown
      // would keep showing the old name until the next full sign-in.
      await update({ name: trimmed })

      setSuccess(true)
      onUpdated(trimmed)
    } catch {
      setError(dict.common.somethingWentWrong)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section title={t.profileTitle} description={t.profileDesc}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
          <User className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            type="text"
            required
            maxLength={MAX_NAME_LENGTH}
            placeholder={t.displayName}
            aria-label={t.displayName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-400">{t.displayNameUpdated}</p>
        )}

        <Button
          type="submit"
          disabled={submitting || name.trim() === (account.name ?? "")}
          className="mt-1 w-fit bg-white text-black hover:bg-zinc-200"
        >
          {submitting ? dict.common.saving : dict.common.save}
        </Button>
      </form>
    </Section>
  )
}

function PasswordSection({
  account,
  onUpdated,
  dict,
}: {
  account: Account
  onUpdated: () => void
  dict: Dictionary
}) {
  const t = dict.settingsPage

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
      setError(
        t.passwordMinLength.replace(
          "{min}",
          String(MIN_PASSWORD_LENGTH)
        )
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordsDontMatch)
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
        setError(data.error ?? dict.common.somethingWentWrong)
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess(true)
      onUpdated()
    } catch {
      setError(dict.common.somethingWentWrong)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section
      title={account.hasPassword ? t.changePasswordTitle : t.setPasswordTitle}
      description={
        account.hasPassword ? t.changePasswordDesc : t.setPasswordDesc
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {account.hasPassword && (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
            <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              type="password"
              required
              placeholder={t.currentPassword}
              aria-label={t.currentPassword}
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
            placeholder={t.newPassword.replace(
              "{min}",
              String(MIN_PASSWORD_LENGTH)
            )}
            aria-label={t.newPassword.replace(
              "{min}",
              String(MIN_PASSWORD_LENGTH)
            )}
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
            placeholder={t.confirmNewPassword}
            aria-label={t.confirmNewPassword}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-400">
            {account.hasPassword ? t.passwordUpdated : t.passwordSet}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="mt-1 w-fit bg-white text-black hover:bg-zinc-200"
        >
          {submitting
            ? dict.common.saving
            : account.hasPassword
            ? t.updatePassword
            : t.setPassword}
        </Button>
      </form>
    </Section>
  )
}

function NotificationLanguageSection({
  account,
  onUpdated,
  dict,
}: {
  account: Account
  onUpdated: (locale: string) => void
  dict: Dictionary
}) {
  const t = dict.settingsPage
  const [saving, setSaving] = useState(false)

  async function choose(locale: string) {
    if (saving || locale === account.locale) {
      return
    }

    setSaving(true)

    try {
      await fetch("/api/account/locale", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      })

      onUpdated(locale)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section
      title={t.notificationLanguageTitle}
      description={t.notificationLanguageDesc}
    >
      <div className="flex flex-wrap items-center gap-2">
        {LOCALES.map((locale) => (
          <Button
            key={locale}
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => choose(locale)}
            className={
              account.locale === locale
                ? "border-white/25 bg-white/15 text-white"
                : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }
          >
            {LOCALE_LABELS[locale]}
          </Button>
        ))}
      </div>

      {!account.locale && (
        <p className="mt-3 text-sm text-zinc-500">
          {t.notificationLanguageNotSet}
        </p>
      )}
    </Section>
  )
}

function NotificationsSection({
  account,
  onUpdated,
  dict,
}: {
  account: Account
  onUpdated: (emailOptOut: boolean) => void
  dict: Dictionary
}) {
  const t = dict.settingsPage
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
      title={t.emailNotificationsTitle}
      description={t.emailNotificationsDesc}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-300">
          {account.emailOptOut
            ? t.emailNotificationsOff
            : t.emailNotificationsOn}
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

function DiscordSection({
  account,
  onUpdated,
  dict,
}: {
  account: Account
  onUpdated: (discordWebhookUrl: string | null) => void
  dict: Dictionary
}) {
  const t = dict.settingsPage

  const [webhookUrl, setWebhookUrl] = useState(
    account.discordWebhookUrl ?? ""
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<
    "ok" | "failed" | null
  >(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError(null)
    setSuccess(false)
    setTestResult(null)

    const trimmed = webhookUrl.trim()

    setSubmitting(true)

    try {
      const response = await fetch("/api/account/discord-webhook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordWebhookUrl: trimmed }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? dict.common.somethingWentWrong)
        return
      }

      setSuccess(true)
      onUpdated(trimmed || null)
    } catch {
      setError(dict.common.somethingWentWrong)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/account/discord-webhook/test", {
        method: "POST",
      })

      setTestResult(response.ok ? "ok" : "failed")
    } catch {
      setTestResult("failed")
    } finally {
      setTesting(false)
    }
  }

  return (
    <Section title={t.discordTitle} description={t.discordDesc}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
          <SiDiscord className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            type="url"
            placeholder="https://discord.com/api/webhooks/..."
            aria-label={t.discordUrl}
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-400">
            {webhookUrl.trim() ? t.discordSaved : t.discordDisconnected}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={
              submitting ||
              webhookUrl.trim() === (account.discordWebhookUrl ?? "")
            }
            className="w-fit bg-white text-black hover:bg-zinc-200"
          >
            {submitting ? dict.common.saving : dict.common.save}
          </Button>

          {account.discordWebhookUrl && (
            <Button
              type="button"
              variant="outline"
              disabled={testing}
              onClick={handleTest}
              className="w-fit border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              {testing ? t.sendingTestMessage : t.sendTestMessage}
            </Button>
          )}

          {testResult === "ok" && (
            <span className="text-sm text-emerald-400">{t.testSent}</span>
          )}
          {testResult === "failed" && (
            <span className="text-sm text-red-400">{t.testFailed}</span>
          )}
        </div>
      </form>
    </Section>
  )
}

function DataExportSection({ dict }: { dict: Dictionary }) {
  const t = dict.settingsPage

  return (
    <Section title={t.yourDataTitle} description={t.yourDataDesc}>
      <Link href="/api/account/export">
        <Button
          type="button"
          variant="outline"
          className="w-fit border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          <Download className="h-4 w-4" />
          {t.downloadMyData}
        </Button>
      </Link>
    </Section>
  )
}

function DangerZone({ dict, path }: { dict: Dictionary; path: (href: string) => string }) {
  const t = dict.settingsPage
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)

    try {
      await fetch("/api/account", { method: "DELETE" })
      await signOut({ callbackUrl: path("/") })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Section title={t.deleteAccountTitle} description={t.deleteAccountDesc}>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-red-400">{t.areYouSure}</p>

          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? t.deletingAccount : t.yesDeleteMyAccount}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setConfirming(false)}
          >
            {dict.common.cancel}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="h-4 w-4" />
          {t.deleteAccountButton}
        </Button>
      )}
    </Section>
  )
}

export default function SettingsPage() {
  const { dict, path, locale } = useI18n()
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
          {dict.settingsPage.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          {dict.settingsPage.title}
        </h1>

        <Suspense fallback={null}>
          <UpgradedBanner dict={dict} />
        </Suspense>

        {loading || !account ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <Section title={dict.settingsPage.emailSectionTitle}>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Mail className="h-4 w-4 text-zinc-500" />
                {account.email}
              </div>
            </Section>

            <SubscriptionSection
              account={account}
              dict={dict}
              path={path}
              locale={locale}
            />

            <ProfileSection
              account={account}
              dict={dict}
              onUpdated={(name) =>
                setAccount((prev) => (prev ? { ...prev, name } : prev))
              }
            />

            <PasswordSection
              account={account}
              dict={dict}
              onUpdated={() =>
                setAccount((prev) =>
                  prev ? { ...prev, hasPassword: true } : prev
                )
              }
            />

            <NotificationLanguageSection
              account={account}
              dict={dict}
              onUpdated={(locale) =>
                setAccount((prev) => (prev ? { ...prev, locale } : prev))
              }
            />

            <NotificationsSection
              account={account}
              dict={dict}
              onUpdated={(emailOptOut) =>
                setAccount((prev) =>
                  prev ? { ...prev, emailOptOut } : prev
                )
              }
            />

            <DiscordSection
              account={account}
              dict={dict}
              onUpdated={(discordWebhookUrl) =>
                setAccount((prev) =>
                  prev ? { ...prev, discordWebhookUrl } : prev
                )
              }
            />

            <DataExportSection dict={dict} />

            <DangerZone dict={dict} path={path} />
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
