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
import { ExternalResourceLinks } from "@/components/shared/external-resource-links"
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
  eventCategoryLabel,
  EVENT_CATEGORIES,
  type EventCategory,
} from "@/lib/constants/event-category"
import { externalResourcesForEvent } from "@/lib/constants/external-resources"
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { resolveEventDescription } from "@/lib/i18n/event-descriptions"
import { localeAlternates } from "@/lib/i18n/alternates"

function fieldLabel(field: string, dict: Dictionary): string {
  const t = dict.eventDetailPage

  const labels: Record<string, string> = {
    title: t.fieldTitle,
    description: t.fieldDescription,
    status: t.fieldStatus,
    category: t.fieldCategory,
    isLimitedTime: t.fieldIsLimitedTime,
  }

  return labels[field] ?? field
}

function formatChangeValue(
  field: string,
  value: string | null,
  dict: Dictionary
): string {
  if (value === null) {
    return "—"
  }

  if (field === "isLimitedTime") {
    return value === "true"
      ? dict.eventDetailPage.limitedTime
      : dict.eventDetailPage.permanent
  }

  if (field === "category") {
    return eventCategoryLabel(value as EventCategory, dict) ?? value
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
  const dict = await getDictionary()
  const locale = await getLocale()

  if (!event) {
    return { title: dict.eventDetailPage.notFoundTitle }
  }

  return {
    title: `${event.title} — ${event.game.name}`,
    description:
      resolveEventDescription(event, locale) ??
      dict.eventDetailPage.metaDescription
        .replace("{title}", event.title)
        .replace("{game}", event.game.name),
    alternates: localeAlternates(locale, `/events/${slug}`),
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await eventQueryService.getBySlug(slug)

  if (!event) {
    notFound()
  }

  const dict = await getDictionary()
  const locale = await getLocale()
  const t = dict.eventDetailPage
  const description = resolveEventDescription(event, locale)

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
  const renderedAt = Date.now()

  const premiumTeaserProps = {
    label: dict.common.premium,
    href: `/${locale}/pricing`,
  }

  // Free for every plan — links to real community sites (u.gg,
  // op.gg, etc.), not data ModeAlert generates. Only shown for
  // categories where "what to play/build" is actually relevant, and
  // picks a mode-specific tier list (e.g. URF) over the generic
  // per-game one when the event title matches — see
  // lib/constants/external-resources.ts.
  const showExternalResources =
    event.category === EVENT_CATEGORIES.PLAYABLE ||
    event.category === EVENT_CATEGORIES.ROTATION_MILESTONE
  const externalResources = showExternalResources
    ? externalResourcesForEvent(event.game.id, event.title)
    : undefined

  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href={`/${locale}/games/${event.game.slug}`}
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
              {(event.trackedUsers === 1
                ? t.personTrackingOne
                : t.personTrackingMany
              ).replace("{count}", String(event.trackedUsers))}
            </Badge>
          )}
        </div>

        {description && (
          <p className="mt-4 max-w-2xl text-sm text-zinc-400">
            {description}
          </p>
        )}

        {event.seriesKey && (
          <p className="mt-2 max-w-2xl text-xs text-zinc-500">
            {t.seriesNote}
          </p>
        )}

        {externalResources && externalResources.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              {t.externalResourcesTitle}
            </p>
            <ExternalResourceLinks
              resources={externalResources}
              className="mt-2 flex flex-wrap gap-3"
            />
            <p className="mt-2 text-xs text-zinc-400">
              {t.externalResourcesDisclaimer}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              {t.firstTracked}
            </p>
            <p className="mt-0.5 text-zinc-300">
              {statistics.firstSeen
                ? new Date(statistics.firstSeen).toLocaleDateString(locale)
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              {t.timesSeen}
            </p>
            <p className="mt-0.5 text-zinc-300">
              {statistics.appearanceCount}
            </p>
          </div>

          {isPremium ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                {t.averageDuration}
              </p>
              <p className="mt-0.5 text-zinc-300">
                {statistics.averageDuration > 0
                  ? formatDuration(statistics.averageDuration, locale)
                  : "—"}
              </p>
            </div>
          ) : (
            <PremiumTeaser {...premiumTeaserProps}>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  {t.averageDuration}
                </p>
                <p className="mt-0.5 text-zinc-300">
                  {t.averageDurationPlaceholder}
                </p>
              </div>
            </PremiumTeaser>
          )}

          {prediction.active ? (
            isPremium ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  {t.estimatedToEnd}
                </p>
                <p className="mt-0.5 text-zinc-300">
                  {predictedEndAt
                    ? new Date(predictedEndAt).toLocaleDateString(locale)
                    : t.notEnoughHistoryYet}
                </p>
                {predictedEndAt && (
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {t.confidencePercent.replace(
                      "{confidence}",
                      String(prediction.confidence)
                    )}
                  </p>
                )}
              </div>
            ) : (
              <PremiumTeaser {...premiumTeaserProps}>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    {t.estimatedToEnd}
                  </p>
                  <p className="mt-0.5 text-zinc-300">
                    {t.estimatedDatePlaceholder}
                  </p>
                </div>
              </PremiumTeaser>
            )
          ) : (
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                {t.lastSeen}
              </p>
              <p className="mt-0.5 text-zinc-300">
                {statistics.lastSeen
                  ? new Date(statistics.lastSeen).toLocaleDateString(locale)
                  : "—"}
              </p>
            </div>
          )}

          {!prediction.active && nextExpectedAt && (
            isPremium ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  {t.typicallyReturnsAfter}
                </p>
                <p className="mt-0.5 text-zinc-300">
                  {recurrenceIntervalMs
                    ? formatDuration(recurrenceIntervalMs, locale)
                    : "—"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {t.nextExpectedAround.replace(
                    "{date}",
                    nextExpectedAt.toLocaleDateString(locale)
                  )}
                  {nextArrival.available &&
                    "confidence" in nextArrival && (
                      <>
                        {t.confidenceParen.replace(
                          "{confidence}",
                          String(nextArrival.confidence)
                        )}
                      </>
                    )}
                </p>
              </div>
            ) : (
              <PremiumTeaser {...premiumTeaserProps}>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    {t.typicallyReturnsAfter}
                  </p>
                  <p className="mt-0.5 text-zinc-300">
                    {t.typicallyReturnsPlaceholder}
                  </p>
                </div>
              </PremiumTeaser>
            )
          )}
        </div>

        {!prediction.active &&
          nextArrival.available &&
          !nextExpectedAt && (
            <p className="mt-3 text-xs text-zinc-400">{t.onlySeenOnce}</p>
          )}

        <div className="mt-10">
          <SectionEyebrow>{t.timelineEyebrow}</SectionEyebrow>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {t.timelineTitle}
          </h2>

          <div className="mt-6 space-y-2">
            {timeline.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noHistoryYet}</p>
            ) : (
              timeline.map((entry) => {
                const duration = entry.endedAt
                  ? entry.endedAt.getTime() - entry.startedAt.getTime()
                  : renderedAt - entry.startedAt.getTime()

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
                        {entry.startedAt.toLocaleString(locale)}
                      </span>
                      <span className="text-zinc-400">→</span>
                      <span className="text-zinc-300">
                        {entry.endedAt
                          ? entry.endedAt.toLocaleString(locale)
                          : t.ongoing}
                      </span>
                    </div>

                    <span className="text-xs text-zinc-500">
                      {formatDuration(duration, locale)}
                      {!entry.endedAt && t.soFar}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="mt-10">
          <SectionEyebrow>{t.changesEyebrow}</SectionEyebrow>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {t.changesTitle}
          </h2>

          <div className="mt-6 space-y-2">
            {changes.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noEditsYet}</p>
            ) : (
              changes.map((change) => (
                <div
                  key={change.id}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-zinc-300">
                      {fieldLabel(change.field, dict)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {change.changedAt.toLocaleString(locale)}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-400">
                    {formatChangeValue(change.field, change.oldValue, dict)}
                    <span className="mx-2 text-zinc-400">→</span>
                    {formatChangeValue(change.field, change.newValue, dict)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-10">
            <SectionEyebrow>{t.alsoTrackedEyebrow}</SectionEyebrow>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {t.alsoTrackedTitle}
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {recommendations.map(({ event: related, trackedTogetherCount }) => (
                <Link
                  key={related.id}
                  href={
                    related.slug
                      ? `/${locale}/events/${related.slug}`
                      : `/${locale}/games/${related.game.slug}`
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
                      {related.game.name} ·{" "}
                      {(trackedTogetherCount === 1
                        ? t.trackerOne
                        : t.trackerMany
                      ).replace("{count}", String(trackedTogetherCount))}
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
