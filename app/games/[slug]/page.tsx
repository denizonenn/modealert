import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { GameIcon } from "@/components/shared/game-icon"
import { EventStatusBadge } from "@/components/shared/event-status-badge"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"

import { gameService } from "@/lib/services/game.service"
import { eventQueryService } from "@/lib/services/event-query.service"
import { eventStatisticsService } from "@/lib/services/event-statistics.service"
import { eventPredictionService } from "@/lib/services/event-prediction.service"
import { formatDuration } from "@/lib/utils"

type EventStatus = "LIVE" | "UPCOMING" | "TRACKING" | "ENDED"

const STATUS_ORDER: Record<EventStatus, number> = {
  LIVE: 0,
  UPCOMING: 1,
  TRACKING: 2,
  ENDED: 3,
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params
  const game = await gameService.getBySlug(slug)

  if (!game) {
    return { title: "Game not found" }
  }

  return {
    title: game.name,
    description: `Every ${game.name} event ModeAlert tracks — current status, when it was last seen, and an estimate of when it'll end based on real history.`,
  }
}

async function getEventInsights(eventId: string) {
  const [statistics, prediction] = await Promise.all([
    eventStatisticsService.getByEvent(eventId),
    eventPredictionService.predict(eventId),
  ])

  const predictedEndAt =
    "predictedEndAt" in prediction ? prediction.predictedEndAt : undefined

  return { statistics, prediction, predictedEndAt }
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params
  const game = await gameService.getBySlug(slug)

  if (!game) {
    notFound()
  }

  const events = await eventQueryService.getByGame(game.id)

  const eventsWithInsights = await Promise.all(
    events.map(async (event) => ({
      event,
      ...(await getEventInsights(event.id)),
    }))
  )

  eventsWithInsights.sort(
    (a, b) =>
      STATUS_ORDER[a.event.status as EventStatus] -
      STATUS_ORDER[b.event.status as EventStatus]
  )

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All games
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <GameIcon
            gameId={game.id}
            logo={game.logo}
            color={game.color}
            size="lg"
          />

          <div>
            <SectionEyebrow>Game</SectionEyebrow>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {game.name}
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm text-zinc-400">
          Every mode and event ModeAlert has ever tracked for{" "}
          {game.name}
          {" "}— current status, how often it comes back, and (once
          we&apos;ve seen it complete at least once) an estimate of
          when it&apos;ll end.
        </p>

        <div className="mt-10 space-y-3">
          {eventsWithInsights.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No events tracked yet for this game — check back after
              the next sync.
            </p>
          ) : (
            eventsWithInsights.map(
              ({ event, statistics, prediction, predictedEndAt }) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{event.title}</h3>
                    <EventStatusBadge
                      status={event.status as EventStatus}
                    />
                  </div>

                  {event.description && (
                    <p className="mt-2 text-sm text-zinc-400">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-600">
                        First tracked
                      </p>
                      <p className="mt-0.5 text-zinc-300">
                        {statistics.firstSeen
                          ? new Date(
                              statistics.firstSeen
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-600">
                        Times seen
                      </p>
                      <p className="mt-0.5 text-zinc-300">
                        {statistics.appearanceCount}
                      </p>
                    </div>

                    {statistics.averageDuration > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-600">
                          Average duration
                        </p>
                        <p className="mt-0.5 text-zinc-300">
                          {formatDuration(statistics.averageDuration)}
                        </p>
                      </div>
                    )}

                    {prediction.active && predictedEndAt && (
                      <div className="sm:col-span-3">
                        <p className="text-xs uppercase tracking-wide text-zinc-600">
                          Estimated to end
                        </p>
                        <p className="mt-0.5 text-zinc-300">
                          {new Date(predictedEndAt).toLocaleDateString()}{" "}
                          <span className="text-xs text-zinc-500">
                            (~{prediction.confidence}% confidence, based
                            on {statistics.appearanceCount} past
                            occurrence
                            {statistics.appearanceCount === 1 ? "" : "s"})
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {prediction.active && !predictedEndAt && (
                    <p className="mt-3 text-xs text-zinc-600">
                      Currently live — not enough history yet to
                      estimate when it ends. We&apos;ll be able to
                      predict this once it&apos;s completed at least
                      once.
                    </p>
                  )}

                  {!prediction.active && statistics.lastSeen && (
                    <p className="mt-3 text-xs text-zinc-600">
                      Last seen{" "}
                      {new Date(statistics.lastSeen).toLocaleDateString()}
                      .
                    </p>
                  )}
                </div>
              )
            )
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
