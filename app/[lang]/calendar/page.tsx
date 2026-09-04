import type { Metadata } from "next"
import Link from "next/link"
import { unstable_cache } from "next/cache"

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

// unstable_cache serializes its return value, so dates cross the
// cache boundary as ISO strings, not Date instances — rehydrated back
// to Date by hydrateRows() right after the cached call returns.
type CachedCalendarRow = Omit<CalendarRow, "date"> & { date: string | null }

// The rows here are the same for every viewer — only whether a
// prediction date is *shown* (vs. blurred behind PremiumTeaser)
// depends on the viewer's plan, decided at render time below. So the
// actual DB work (event fetch, history, predictions — the expensive
// part of this page) is cacheable independent of auth() entirely.
// Previously this lived directly in the page body behind a route-level
// `export const revalidate = 1800`, but that was silently dead: Next
// treats any route calling auth() as fully dynamic regardless of a
// declared revalidate window, so it ran fresh on every request (see
// docs/06_DECISIONS.md ADR-059 follow-up). unstable_cache gives it the
// 30-minute window that was always the intent, matching the sync
// cadence, without needing the whole route to skip auth().
const buildCalendarRows = unstable_cache(
  async (): Promise<{
    liveNow: CachedCalendarRow[]
    endingSoon: CachedCalendarRow[]
    returning: CachedCalendarRow[]
  }> => {
    const events = await eventQueryService.getAll()
    const limitedTime = events.filter((event) => event.isLimitedTime)

    const now = Date.now()

    const liveNow: CachedCalendarRow[] = []
    const endingSoon: CachedCalendarRow[] = []
    const returning: CachedCalendarRow[] = []

    const needsPrediction = limitedTime.filter((event) => {
      const status = event.status as EventStatus
      return status === "LIVE" || status === "TRACKING" || status === "ENDED"
    })

    // Independent of each other — one batched pair of DB round trips
    // for every limited-time event's history, instead of 2 per event.
    const [liveSince, predictions] = await Promise.all([
      // Real "live since" dates from EventHistory. This column used
      // to show `event.lastChecked` — the last sync timestamp —
      // which, with a daily sync, meant every single live row
      // displayed today's date, reading like an event date while
      // carrying no event information at all.
      getOpenHistoryStartsByEventIds(
        limitedTime
          .filter((event) => event.status === "LIVE")
          .map((event) => event.id)
      ),
      eventPredictionService.predictMany(
        needsPrediction.map((event) => ({
          id: event.id,
          seriesKey: event.seriesKey,
        }))
      ),
    ])

    for (const event of limitedTime) {
      const status = event.status as EventStatus

      if (status === "LIVE") {
        liveNow.push({
          id: event.id,
          title: event.title,
          slug: event.slug,
          status,
          game: event.game,
          date: liveSince.get(event.id)?.toISOString() ?? null,
          researched: false,
        })
      }

      if (status !== "LIVE" && status !== "TRACKING" && status !== "ENDED") {
        continue
      }

      const result = predictions.get(event.id)
      if (!result) {
        continue
      }
      const { prediction, nextArrival } = result

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
          date: prediction.predictedEndAt.toISOString(),
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
          date: nextArrival.nextExpectedAt.toISOString(),
          researched:
            "researched" in nextArrival &&
            nextArrival.researched === true,
        })
      }
    }

    liveNow.sort((a, b) => a.title.localeCompare(b.title))
    endingSoon.sort(
      (a, b) =>
        (a.date ? new Date(a.date).getTime() : 0) -
        (b.date ? new Date(b.date).getTime() : 0)
    )
    returning.sort(
      (a, b) =>
        (a.date ? new Date(a.date).getTime() : 0) -
        (b.date ? new Date(b.date).getTime() : 0)
    )

    return { liveNow, endingSoon, returning }
  },
  ["calendar-rows"],
  { revalidate: 1800 }
)

function hydrateRows(rows: CachedCalendarRow[]): CalendarRow[] {
  return rows.map((row) => ({
    ...row,
    date: row.date ? new Date(row.date) : null,
  }))
}

export default async function CalendarPage() {
  // Independent of each other — fetched concurrently instead of as a
  // sequential waterfall (see docs/06_DECISIONS.md ADR-059).
  const [dict, locale, session, cached] = await Promise.all([
    getDictionary(),
    getLocale(),
    auth(),
    buildCalendarRows(),
  ])

  const plan = await billingService.getPlan(session?.user?.id)
  const isPremium = plan === PLANS.PREMIUM

  const liveNow = hydrateRows(cached.liveNow)
  const endingSoon = hydrateRows(cached.endingSoon)
  const returning = hydrateRows(cached.returning)

  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
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
          <p className="text-[10px] text-zinc-400">{researchedLabel}</p>
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
