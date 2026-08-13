"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

import Link from "next/link"

import { useOnboardingStore } from "@/stores/onboarding-store"
import { useEvents } from "@/hooks/use-events"
import { useTrackEvent } from "@/hooks/use-track-event"

import { Button } from "@/components/ui/button"
import { FREE_WATCHLIST_LIMIT } from "@/lib/constants/plan"
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events"

export default function FinishStep() {
  const router = useRouter()
  const track = useTrackEvent()

  const { selectedEvents, clear } = useOnboardingStore()
  const { events } = useEvents()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  const watchedEvents = events.filter((event) =>
    selectedEvents.includes(event.id)
  )

  async function handleFinish() {
    setSubmitting(true)
    setError(null)
    setLimitReached(false)

    try {
      const results = await Promise.all(
        selectedEvents.map((eventId) =>
          fetch("/api/watchlists", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventId,
            }),
          })
        )
      )

      if (results.some((response) => response.status === 402)) {
        // Whatever fit under the free limit is already saved — this
        // just stops here instead of claiming full success.
        track(ANALYTICS_EVENTS.WATCHLIST_LIMIT_HIT, "onboarding")
        setLimitReached(true)
        return
      }

      if (results.some((response) => !response.ok)) {
        throw new Error("One or more events failed to save.")
      }

      track(
        ANALYTICS_EVENTS.ONBOARDING_FINISHED,
        String(selectedEvents.length)
      )
      clear()
      router.push("/dashboard")
    } catch {
      setError(
        "Something went wrong saving your watchlist. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleContinueAnyway() {
    track(ANALYTICS_EVENTS.ONBOARDING_FINISHED, "limit-reached")
    clear()
    router.push("/dashboard")
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand">
        <CheckCircle2 className="h-7 w-7 text-white" />
      </div>

      <h2 className="mt-6 text-2xl font-semibold">
        You&apos;re about to track {watchedEvents.length}{" "}
        {watchedEvents.length === 1 ? "event" : "events"}
      </h2>

      <p className="mt-2 text-zinc-400">
        We&apos;ll check for changes automatically and email you the
        moment something goes live.
      </p>

      {watchedEvents.length > 0 ? (
        <div className="mt-8 space-y-2 text-left">
          {watchedEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="text-xs text-zinc-500">
                  {event.game.name}
                </p>
                <p className="font-medium">{event.title}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-zinc-500">
          You haven&apos;t picked any events yet — go back and select
          at least one.
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      {limitReached ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-zinc-400">
            The free plan tracks up to {FREE_WATCHLIST_LIMIT} events —
            we saved as many of your picks as fit.{" "}
            <Link
              href="/pricing"
              className="font-medium text-white hover:underline"
            >
              Upgrade to Premium
            </Link>{" "}
            for unlimited tracking, or continue with what fit.
          </p>

          <Button
            size="lg"
            onClick={handleContinueAnyway}
            className="h-12 rounded-full bg-gradient-brand px-10 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
          >
            Continue to dashboard
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          onClick={handleFinish}
          disabled={submitting || watchedEvents.length === 0}
          className="mt-8 h-12 rounded-full bg-gradient-brand px-10 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Start Tracking"
          )}
        </Button>
      )}
    </div>
  )
}
