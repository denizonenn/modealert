import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { GameIcon } from "@/components/shared/game-icon"
import { EventStatusBadge } from "@/components/shared/event-status-badge"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { Badge } from "@/components/ui/badge"

import { eventQueryService } from "@/lib/services/event-query.service"
import { eventHistoryService } from "@/lib/services/event-history.service"
import { eventStatisticsService } from "@/lib/services/event-statistics.service"
import { eventPredictionService } from "@/lib/services/event-prediction.service"
import { getProviderName } from "@/lib/providers/core/registry"
import { formatDuration } from "@/lib/utils"

type EventStatus = "LIVE" | "UPCOMING" | "TRACKING" | "ENDED"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await eventQueryService.getBySlug(slug)

  if (!event) {
    return { title: "Event not found" }
  }

  return {
    title: `${event.title} — ${event.game.name}`,
    description:
      event.description ??
      `Tracking history and status for ${event.title} in ${event.game.name}.`,
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await eventQueryService.getBySlug(slug)

  if (!event) {
    notFound()
  }

  const [history, statistics, prediction] = await Promise.all([
    eventHistoryService.getByEvent(event.id),
    eventStatisticsService.getByEvent(event.id),
    eventPredictionService.predict(event.id),
  ])

  const predictedEndAt =
    "predictedEndAt" in prediction ? prediction.predictedEndAt : undefined

  const timeline = [...history].reverse()

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href={`/games/${event.game.slug}`}
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {event.game.name}
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <GameIcon
            gameId={event.game.id}
            logo={event.game.logo}
            color={event.game.color}
            size="lg"
          />

          <div>
            <SectionEyebrow>{event.game.name}</SectionEyebrow>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <EventStatusBadge status={event.status as EventStatus} />
          <Badge
            variant="outline"
            className="border-white/10 bg-white/5 text-zinc-400"
          >
            {getProviderName(event.source)}
          </Badge>
        </div>

        {event.description && (
          <p className="mt-4 max-w-2xl text-sm text-zinc-400">
            {event.description}
          </p>
        )}

        <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              First tracked
            </p>
            <p className="mt-0.5 text-zinc-300">
              {statistics.firstSeen
                ? new Date(statistics.firstSeen).toLocaleDateString()
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

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              Average duration
            </p>
            <p className="mt-0.5 text-zinc-300">
              {statistics.averageDuration > 0
                ? formatDuration(statistics.averageDuration)
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              {prediction.active ? "Estimated to end" : "Last seen"}
            </p>
            <p className="mt-0.5 text-zinc-300">
              {prediction.active
                ? predictedEndAt
                  ? new Date(predictedEndAt).toLocaleDateString()
                  : "Not enough history yet"
                : statistics.lastSeen
                  ? new Date(statistics.lastSeen).toLocaleDateString()
                  : "—"}
            </p>
            {prediction.active && predictedEndAt && (
              <p className="mt-0.5 text-xs text-zinc-600">
                ~{prediction.confidence}% confidence
              </p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <SectionEyebrow>Timeline</SectionEyebrow>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Every occurrence we&apos;ve tracked
          </h2>

          <div className="mt-6 space-y-2">
            {timeline.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No history recorded yet — check back after the next sync.
              </p>
            ) : (
              timeline.map((entry) => {
                const duration = entry.endedAt
                  ? entry.endedAt.getTime() - entry.startedAt.getTime()
                  : Date.now() - entry.startedAt.getTime()

                return (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <EventStatusBadge
                        status={entry.status as EventStatus}
                      />
                      <span className="text-zinc-300">
                        {entry.startedAt.toLocaleString()}
                      </span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-zinc-300">
                        {entry.endedAt
                          ? entry.endedAt.toLocaleString()
                          : "ongoing"}
                      </span>
                    </div>

                    <span className="text-xs text-zinc-500">
                      {formatDuration(duration)}
                      {!entry.endedAt && " so far"}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
