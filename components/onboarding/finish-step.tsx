"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

import { useOnboardingStore } from "@/stores/onboarding-store"
import { useEvents } from "@/hooks/use-events"

import { Button } from "@/components/ui/button"

export default function FinishStep() {
  const router = useRouter()

  const { selectedEvents, clear } = useOnboardingStore()
  const { events } = useEvents()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const watchedEvents = events.filter((event) =>
    selectedEvents.includes(event.id)
  )

  async function handleFinish() {
    setSubmitting(true)
    setError(null)

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

      if (results.some((response) => !response.ok)) {
        throw new Error("One or more events failed to save.")
      }

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
    </div>
  )
}
