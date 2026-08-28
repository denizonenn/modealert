import type { Metadata } from "next"
import Link from "next/link"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { GameIcon } from "@/components/shared/game-icon"
import { EventStatusBadge } from "@/components/shared/event-status-badge"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { PremiumTeaser } from "@/components/shared/premium-teaser"

import { auth } from "@/auth"
import { eventQueryService } from "@/lib/services/event-query.service"
import { eventPredictionService } from "@/lib/services/event-prediction.service"
import { billingService } from "@/lib/services/billing.service"
import { getOpenHistoryStartsByEventIds } from "@/lib/repositories/event-history.repository"
import { PLANS } from "@/lib/constants/plan"
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries"
import { localeAlternates } from "@/lib/i18n/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()])

  return {
    title: dict.calendar.eyebrow,
    description: dict.calendar.metaDescription,
    alternates: localeAlternates(locale, "/calendar"),
  }
}

export const revalidate = 1800

type EventStatus = "LIVE" | "UPCOMING" | "TRACKING" | "ENDED"

interface CalendarRow {
  id: string
  title: string
  slug: string | null
  status: EventStatus
  game: { id: string; name: string; slug: string; logo: string; color: string }
  // Null for a live event we have no recorded start for — better to
  // show nothing than a date that isn't about the event.
  date: Date | null
  researched: boolean
}

// Read once per render of this server-rendered, ISR-cached page
// (revalidate = 1800). Extracted so it reads as a deliberate
// snapshot of "now" rather than an ambient clock call inside the
// component body.
function currentTime(): number {
  return Date.now()
}

async function getPredictionFor(event: {
  id: string
  seriesKey: string | null
}) {
  return event.seriesKey
    ? Promise.all([
        eventPredictionService.predictBySeriesKey(event.seriesKey),
        eventPredictionService.predictNextArrivalBySeriesKey(
          event.seriesKey
        ),
      ])
    : Promise.all([
        eventPredictionService.predict(event.id),
        eventPredictionService.predictNextArrival(event.id),
      ])
}

export default async function CalendarPage() {
  const dict = await getDictionary()
  const locale = await getLocale()
  const session = await auth()
  const plan = await billingService.getPlan(session?.user?.id)
  const isPremium = plan === PLANS.PREMIUM

  const events = await eventQueryService.getAll()
  const limitedTime = events.filter((event) => event.isLimitedTime)

  // Real "live since" dates from EventHistory. This column used to
  // show `event.lastChecked` — the last sync timestamp — which, with
  // a daily sync, meant every single live row displayed today's date,
  // reading like an event date while carrying no event information at
  // all.
  const liveSince = await getOpenHistoryStartsByEventIds(
    limitedTime
      .filter((event) => event.status === "LIVE")
      .map((event) => event.id)
  )

  const now = currentTime()

  const liveNow: CalendarRow[] = []
  const endingSoon: CalendarRow[] = []
  const returning: CalendarRow[] = []

  await Promise.all(
    limitedTime.map(async (event) => {
      const status = event.status as EventStatus

      if (status === "LIVE") {
        liveNow.push({
          id: event.id,
          title: event.title,
          slug: event.slug,
          status,
          game: event.game,
          date: liveSince.get(event.id) ?? null,
          researched: false,
        })
      }

      if (status !== "LIVE" && status !== "TRACKING" && status !== "ENDED") {
        return
      }

      const [prediction, nextArrival] = await getPredictionFor(event)

      // A predicted end date that's already passed while the event is
      // still live means the estimate was simply wrong — showing it
      // under "Estimated to end" presents a date in the past as a
      // forecast (seen live: "Mayhem Set 2 — Aug 14" on Aug 19).
      if (
        (status === "LIVE" || status === "TRACKING") &&
        "predictedEndAt" in prediction &&
        prediction.predictedEndAt &&
        prediction.predictedEndAt.getTime() > now
      ) {
        endingSoon.push({
          id: event.id,
          title: event.title,
          slug: event.slug,
          status,
          game: event.game,
          date: prediction.predictedEndAt,
          researched:
            "researched" in prediction &&
            prediction.researched === true,
        })
      }

      // Same reasoning as above — a "typically returns" date that's
      // already passed, on an event that's still ENDED, is a stale
      // estimate, not a forecast.
      if (
        status === "ENDED" &&
        nextArrival.available &&
        "nextExpectedAt" in nextArrival &&
        nextArrival.nextExpectedAt &&
        nextArrival.nextExpectedAt.getTime() > now
      ) {
        returning.push({
          id: event.id,
          title: event.title,
          slug: event.slug,
          status,
          game: event.game,
          date: nextArrival.nextExpectedAt,
          researched:
            "researched" in nextArrival &&
            nextArrival.researched === true,
        })
      }
    })
  )

  liveNow.sort((a, b) => a.title.localeCompare(b.title))
  endingSoon.sort(
    (a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0)
  )
  returning.sort(
    (a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0)
  )

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-4 text-center">
        <SectionEyebrow className="justify-center">{dict.calendar.eyebrow}</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          {dict.calendar.title}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          {dict.calendar.intro}
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 space-y-14">
        <CalendarSection
          title={dict.calendar.liveNow}
          emptyMessage={dict.calendar.liveNowEmpty}
        >
          {liveNow.map((row) => (
            <CalendarRowView
              key={row.id}
              row={row}
              isPremium={isPremium}
              isPrediction={false}
              sinceLabel={dict.calendar.since}
              researchedLabel={dict.calendar.researched}
              locale={locale}
              premiumLabel={dict.common.premium}
              pricingHref={`/${locale}/pricing`}
              localeHref={(href) => `/${locale}${href}`}
            />
          ))}
        </CalendarSection>

        <CalendarSection
          title={dict.calendar.estimatedToEnd}
          emptyMessage={dict.calendar.estimatedToEndEmpty}
        >
          {endingSoon.map((row) => (
            <CalendarRowView
              key={row.id}
              row={row}
              isPremium={isPremium}
              isPrediction={true}
              sinceLabel={dict.calendar.since}
              researchedLabel={dict.calendar.researched}
              locale={locale}
              premiumLabel={dict.common.premium}
              pricingHref={`/${locale}/pricing`}
              localeHref={(href) => `/${locale}${href}`}
            />
          ))}
        </CalendarSection>

        <CalendarSection
          title={dict.calendar.typicallyReturns}
          emptyMessage={dict.calendar.typicallyReturnsEmpty}
        >
          {returning.map((row) => (
            <CalendarRowView
              key={row.id}
              row={row}
              isPremium={isPremium}
              isPrediction={true}
              sinceLabel={dict.calendar.since}
              researchedLabel={dict.calendar.researched}
              locale={locale}
              premiumLabel={dict.common.premium}
              pricingHref={`/${locale}/pricing`}
              localeHref={(href) => `/${locale}${href}`}
            />
          ))}
        </CalendarSection>
      </section>

      <Footer />
    </main>
  )
}

function CalendarSection({
  title,
  emptyMessage,
  children,
}: {
  title: string
  emptyMessage: string
  children: React.ReactNode
}) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children)

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

      <div className="mt-4 space-y-2">
        {hasChildren ? (
          children
        ) : (
          <p className="text-sm text-zinc-500">{emptyMessage}</p>
        )}
      </div>
    </div>
  )
}

function CalendarRowView({
  row,
  isPremium,
  isPrediction,
  sinceLabel,
  researchedLabel,
  locale,
  premiumLabel,
  pricingHref,
  localeHref,
}: {
  row: CalendarRow
  isPremium: boolean
  isPrediction: boolean
  sinceLabel: string
  researchedLabel: string
  locale: string
  premiumLabel: string
  pricingHref: string
  localeHref: (href: string) => string
}) {
  // "Live now" shows a real current status, not a forecast — free for
  // everyone. "Estimated to end"/"Typically returns" are the same
  // predicted-date feature that's Premium-gated on /events/[slug]
  // (ADR-041) — must stay gated here too, regardless of whether the
  // event happens to be LIVE right now.
  const dateGated = isPrediction

  const content = (
    <Link
      href={localeHref(
        row.slug ? `/events/${row.slug}` : `/games/${row.game.slug}`
      )}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-colors hover:border-white/20"
    >
      <GameIcon
        gameId={row.game.id}
        logo={row.game.logo}
        color={row.game.color}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{row.title}</p>
        <p className="text-xs text-zinc-500">{row.game.name}</p>
      </div>
      <div className="text-right">
        {row.date && (
          <p className="text-xs text-zinc-300">
            {isPrediction ? "" : `${sinceLabel} `}
            {row.date.toLocaleDateString(locale, {
              month: "short",
              day: "numeric",
            })}
          </p>
        )}
        {row.researched && (
          <p className="text-[10px] text-zinc-600">{researchedLabel}</p>
        )}
      </div>
      <EventStatusBadge status={row.status} />
    </Link>
  )

  if (dateGated && !isPremium) {
    return (
      <PremiumTeaser label={premiumLabel} href={pricingHref}>
        {content}
      </PremiumTeaser>
    )
  }

  return content
}
