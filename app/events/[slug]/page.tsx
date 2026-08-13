import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Users } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { GameIcon } from "@/components/shared/game-icon"
import { EventStatusBadge } from "@/components/shared/event-status-badge"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { PremiumTeaser } from "@/components/shared/premium-teaser"
import { Badge } from "@/components/ui/badge"

import { auth } from "@/auth"
import { eventQueryService } from "@/lib/services/event-query.service"
import { eventHistoryService } from "@/lib/services/event-history.service"
import { eventStatisticsService } from "@/lib/services/event-statistics.service"
import { eventPredictionService } from "@/lib/services/event-prediction.service"
import { eventChangeService } from "@/lib/services/event-change.service"
import { billingService } from "@/lib/services/billing.service"
import { getProviderName } from "@/lib/providers/core/registry"
import { formatDuration } from "@/lib/utils"
import { PLANS } from "@/lib/constants/plan"
import {
  EVENT_CATEGORY_LABELS,
  type EventCategory,
} from "@/lib/constants/event-category"

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  status: "Status",
  category: "Category",
  isLimitedTime: "Permanence",
}

function formatChangeValue(field: string, value: string | null): string {
  if (value === null) {
    return "—"
  }

  if (field === "isLimitedTime") {
    return value === "true" ? "Limited Time" : "Permanent"
  }

  if (field === "category") {
    return EVENT_CATEGORY_LABELS[value as EventCategory] ?? value
  }

  return value
}

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

  // Some events (e.g. every "Mayhem Set N" pass window, every "Season
  // N: Act X" battle pass) are real, successive occurrences of the
  // same recurring thing under different event ids — see
  // docs/06_DECISIONS.md ADR-031. When that's the case, stats/history/
  // predictions look at the whole series instead of just this one
  // occurrence's row, so "times seen"/"typically returns after" mean
  // what they say.
  const [history, statistics, prediction, nextArrival] = event.seriesKey
    ? await Promise.all([
        eventHistoryService.getBySeriesKey(event.seriesKey),
        eventStatisticsService.getBySeriesKey(event.seriesKey),
        eventPredictionService.predictBySeriesKey(event.seriesKey),
        eventPredictionService.predictNextArrivalBySeriesKey(
          event.seriesKey
        ),
      ])
    : await Promise.all([
        eventHistoryService.getByEvent(event.id),
        eventStatisticsService.getByEvent(event.id),
        eventPredictionService.predict(event.id),
        eventPredictionService.predictNextArrival(event.id),
      ])

  // Field-level edit log (title/description/status/category/permanence
  // changing over time) — separate from the LIVE/TRACKING occurrence
  // spans above, and scoped to this specific event row (not
  // series-wide, since a series' other occurrences are different rows
  // with their own independent edit history).
  const changes = await eventChangeService.getByEvent(event.id)

  // Real collaborative filtering — of the users tracking this event,
  // what else do they track most. See docs/06_DECISIONS.md ADR-047.
  const recommendations = await eventQueryService.getRecommendationsFor(
    event.id
  )

  // Average duration / estimated-end / next-expected-arrival are the
  // Premium-gated "deep insight" tier — see docs/06_DECISIONS.md
  // ADR-041. First tracked/times seen/raw timeline/changes stay free.
  const session = await auth()
  const plan = await billingService.getPlan(session?.user?.id)
  const isPremium = plan === PLANS.PREMIUM

  const predictedEndAt =
    "predictedEndAt" in prediction ? prediction.predictedEndAt : undefined

  const nextExpectedAt =
    nextArrival.available && "nextExpectedAt" in nextArrival
      ? nextArrival.nextExpectedAt
      : undefined

  const recurrenceIntervalMs =
    nextArrival.available && "recurrenceIntervalMs" in nextArrival
      ? nextArrival.recurrenceIntervalMs
      : undefined

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
          {event.trackedUsers > 0 && (
            <Badge
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-400"
            >
              <Users className="mr-1 h-3 w-3" />
              {event.trackedUsers}{" "}
              {event.trackedUsers === 1 ? "person" : "people"} tracking
              this
            </Badge>
          )}
        </div>

        {event.description && (
          <p className="mt-4 max-w-2xl text-sm text-zinc-400">
            {event.description}
          </p>
        )}

        {event.seriesKey && (
          <p className="mt-2 max-w-2xl text-xs text-zinc-500">
            Part of a recurring series — the stats and timeline below
            span every occurrence we&apos;ve tracked, not just this
            one.
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

          {isPremium ? (
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
          ) : (
            <PremiumTeaser>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Average duration
                </p>
                <p className="mt-0.5 text-zinc-300">12h 34m</p>
              </div>
            </PremiumTeaser>
          )}

          {prediction.active ? (
            isPremium ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Estimated to end
                </p>
                <p className="mt-0.5 text-zinc-300">
                  {predictedEndAt
                    ? new Date(predictedEndAt).toLocaleDateString()
                    : "Not enough history yet"}
                </p>
                {predictedEndAt && (
                  <p className="mt-0.5 text-xs text-zinc-600">
                    ~{prediction.confidence}% confidence
                  </p>
                )}
              </div>
            ) : (
              <PremiumTeaser>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-600">
                    Estimated to end
                  </p>
                  <p className="mt-0.5 text-zinc-300">Jan 1, 2027</p>
                </div>
              </PremiumTeaser>
            )
          ) : (
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Last seen
              </p>
              <p className="mt-0.5 text-zinc-300">
                {statistics.lastSeen
                  ? new Date(statistics.lastSeen).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          )}

          {!prediction.active && nextExpectedAt && (
            isPremium ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Typically returns after
                </p>
                <p className="mt-0.5 text-zinc-300">
                  {recurrenceIntervalMs
                    ? formatDuration(recurrenceIntervalMs)
                    : "—"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  next expected around{" "}
                  {nextExpectedAt.toLocaleDateString()}
                  {nextArrival.available &&
                    "confidence" in nextArrival && (
                      <> (~{nextArrival.confidence}% confidence)</>
                    )}
                </p>
              </div>
            ) : (
              <PremiumTeaser>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-600">
                    Typically returns after
                  </p>
                  <p className="mt-0.5 text-zinc-300">14 days</p>
                </div>
              </PremiumTeaser>
            )
          )}
        </div>

        {!prediction.active &&
          nextArrival.available &&
          !nextExpectedAt && (
            <p className="mt-3 text-xs text-zinc-600">
              Only seen once so far — not enough history yet to
              estimate when it typically comes back. We&apos;ll be
              able to once it&apos;s reappeared at least twice.
            </p>
          )}

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
                      {event.seriesKey &&
                        entry.event.title !== event.title && (
                          <span className="text-zinc-500">
                            {entry.event.title}
                          </span>
                        )}
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

        <div className="mt-10">
          <SectionEyebrow>Changes</SectionEyebrow>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            What&apos;s changed about this event
          </h2>

          <div className="mt-6 space-y-2">
            {changes.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No edits recorded yet — ModeAlert only started tracking
                this on 2026-08-13, and logs a change the next time this
                event&apos;s title, description, status, category, or
                permanence actually differs from what was last synced.
              </p>
            ) : (
              changes.map((change) => (
                <div
                  key={change.id}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-zinc-300">
                      {FIELD_LABELS[change.field] ?? change.field}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {change.changedAt.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-400">
                    {formatChangeValue(change.field, change.oldValue)}
                    <span className="mx-2 text-zinc-600">→</span>
                    {formatChangeValue(change.field, change.newValue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-10">
            <SectionEyebrow>Also Tracked</SectionEyebrow>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              People tracking this also track
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {recommendations.map(({ event: related, trackedTogetherCount }) => (
                <Link
                  key={related.id}
                  href={
                    related.slug
                      ? `/events/${related.slug}`
                      : `/games/${related.game.slug}`
                  }
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-colors hover:border-white/20"
                >
                  <GameIcon
                    gameId={related.game.id}
                    logo={related.game.logo}
                    color={related.game.color}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {related.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {related.game.name} · {trackedTogetherCount}{" "}
                      {trackedTogetherCount === 1 ? "tracker" : "trackers"}{" "}
                      in common
                    </p>
                  </div>
                  <EventStatusBadge status={related.status as EventStatus} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
