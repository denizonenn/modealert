import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { GameIcon } from "@/components/shared/game-icon"
import { EventStatusBadge } from "@/components/shared/event-status-badge"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { RotationBadge } from "@/components/shared/rotation-badge"
import { PremiumTeaser } from "@/components/shared/premium-teaser"
import { ExternalResourceLinks } from "@/components/shared/external-resource-links"
import { FollowGameButton } from "@/components/games/follow-game-button"

import { auth } from "@/auth"
import { gameService } from "@/lib/services/game.service"
import { eventQueryService } from "@/lib/services/event-query.service"
import { eventStatisticsService } from "@/lib/services/event-statistics.service"
import { eventPredictionService } from "@/lib/services/event-prediction.service"
import { billingService } from "@/lib/services/billing.service"
import { formatDuration } from "@/lib/utils"
import { EXTERNAL_RESOURCES } from "@/lib/constants/external-resources"
import { PLANS } from "@/lib/constants/plan"
import {
  categorySortKey,
  eventCategoryLabel,
  type EventCategory,
} from "@/lib/constants/event-category"
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries"
import { resolveEventDescription } from "@/lib/i18n/event-descriptions"
import { localeAlternates } from "@/lib/i18n/alternates"

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
  const dict = await getDictionary()
  const locale = await getLocale()

  if (!game) {
    return { title: dict.gameDetailPage.notFoundTitle }
  }

  return {
    title: game.name,
    description: dict.gameDetailPage.metaDescription.replace(
      "{game}",
      game.name
    ),
    alternates: localeAlternates(locale, `/games/${slug}`),
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

  const dict = await getDictionary()
  const locale = await getLocale()
  const t = dict.gameDetailPage

  const session = await auth()
  const plan = await billingService.getPlan(session?.user?.id)
  const isPremium = plan === PLANS.PREMIUM

  const events = await eventQueryService.getByGame(game.id)

  const eventsWithInsights = await Promise.all(
    events.map(async (event) => ({
      event,
      ...(await getEventInsights(event.id)),
    }))
  )

  eventsWithInsights.sort(
    (a, b) =>
      categorySortKey(
        a.event.category,
        a.event.isLimitedTime,
        STATUS_ORDER[a.event.status as EventStatus]
      ) -
      categorySortKey(
        b.event.category,
        b.event.isLimitedTime,
        STATUS_ORDER[b.event.status as EventStatus]
      )
  )

  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href={`/${locale}/games`}
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.allGames}
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <GameIcon
            gameId={game.id}
            logo={game.logo}
            color={game.color}
            size="lg"
          />

          <div>
            <SectionEyebrow>{t.gameEyebrow}</SectionEyebrow>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {game.name}
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm text-zinc-400">
          {t.intro.replace("{game}", game.name)}
        </p>

        <div className="mt-6">
          <FollowGameButton gameId={game.id} gameName={game.name} />
        </div>

        {EXTERNAL_RESOURCES[game.id] && (
          <ExternalResourceLinks resources={EXTERNAL_RESOURCES[game.id]!} />
        )}

        <div className="mt-10 space-y-3">
          {eventsWithInsights.length === 0 ? (
            <p className="text-sm text-zinc-500">{t.noEventsTracked}</p>
          ) : (
            eventsWithInsights.map(
              ({ event, statistics, prediction, predictedEndAt }) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">
                      {event.slug ? (
                        <Link
                          href={`/${locale}/events/${event.slug}`}
                          className="hover:text-zinc-300"
                        >
                          {event.title}
                        </Link>
                      ) : (
                        event.title
                      )}
                    </h3>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        {eventCategoryLabel(
                          event.category as EventCategory,
                          dict
                        ) ?? event.category}
                      </span>
                      <RotationBadge isLimitedTime={event.isLimitedTime} />
                      <EventStatusBadge
                        status={event.status as EventStatus}
                      />
                    </div>
                  </div>

                  {resolveEventDescription(event, locale) && (
                    <p className="mt-2 text-sm text-zinc-400">
                      {resolveEventDescription(event, locale)}
                    </p>
                  )}

                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-400">
                        {t.firstTracked}
                      </p>
                      <p className="mt-0.5 text-zinc-300">
                        {statistics.firstSeen
                          ? new Date(
                              statistics.firstSeen
                            ).toLocaleDateString(locale)
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

                    {statistics.averageDuration > 0 &&
                      (isPremium ? (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-zinc-400">
                            {t.averageDuration}
                          </p>
                          <p className="mt-0.5 text-zinc-300">
                            {formatDuration(
                              statistics.averageDuration,
                              locale
                            )}
                          </p>
                        </div>
                      ) : (
                        <PremiumTeaser
                          label={dict.common.premium}
                          href={`/${locale}/pricing`}
                        >
                          <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-400">
                              {t.averageDuration}
                            </p>
                            <p className="mt-0.5 text-zinc-300">
                              {t.averageDurationPlaceholder}
                            </p>
                          </div>
                        </PremiumTeaser>
                      ))}

                    {prediction.active &&
                      predictedEndAt &&
                      (isPremium ? (
                        <div className="sm:col-span-3">
                          <p className="text-xs uppercase tracking-wide text-zinc-400">
                            {t.estimatedToEnd}
                          </p>
                          <p className="mt-0.5 text-zinc-300">
                            {new Date(predictedEndAt).toLocaleDateString(
                              locale
                            )}{" "}
                            <span className="text-xs text-zinc-500">
                              {(statistics.appearanceCount === 1
                                ? t.confidenceBasedOnOne
                                : t.confidenceBasedOnMany
                              )
                                .replace(
                                  "{confidence}",
                                  String(prediction.confidence)
                                )
                                .replace(
                                  "{count}",
                                  String(statistics.appearanceCount)
                                )}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="sm:col-span-3">
                          <PremiumTeaser
                            label={dict.common.premium}
                            href={`/${locale}/pricing`}
                          >
                            <div>
                              <p className="text-xs uppercase tracking-wide text-zinc-400">
                                {t.estimatedToEnd}
                              </p>
                              <p className="mt-0.5 text-zinc-300">
                                {t.estimatedDatePlaceholder}{" "}
                                <span className="text-xs text-zinc-500">
                                  {t.confidencePlaceholder}
                                </span>
                              </p>
                            </div>
                          </PremiumTeaser>
                        </div>
                      ))}
                  </div>

                  {prediction.active && !predictedEndAt && (
                    <p className="mt-3 text-xs text-zinc-400">
                      {t.notEnoughHistory}
                    </p>
                  )}

                  {!prediction.active && statistics.lastSeen && (
                    <p className="mt-3 text-xs text-zinc-400">
                      {t.lastSeen.replace(
                        "{date}",
                        new Date(statistics.lastSeen).toLocaleDateString(
                          locale
                        )
                      )}
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
