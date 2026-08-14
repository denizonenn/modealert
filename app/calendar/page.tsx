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
import { PLANS } from "@/lib/constants/plan"

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "When ModeAlert's tracked limited-time modes and events are expected to end, and when the ended ones typically come back — based on real tracked history and, where researched, published historical patterns.",
}

export const revalidate = 1800

type EventStatus = "LIVE" | "UPCOMING" | "TRACKING" | "ENDED"

interface CalendarRow {
  id: string
  title: string
  slug: string | null
  status: EventStatus
  game: { id: string; name: string; slug: string; logo: string; color: string }
  date: Date
  researched: boolean
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
  const session = await auth()
  const plan = await billingService.getPlan(session?.user?.id)
  const isPremium = plan === PLANS.PREMIUM

  const events = await eventQueryService.getAll()
  const limitedTime = events.filter((event) => event.isLimitedTime)

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
          date: event.lastChecked
            ? new Date(event.lastChecked)
            : new Date(),
          researched: false,
        })
      }

      if (status !== "LIVE" && status !== "TRACKING" && status !== "ENDED") {
        return
      }

      const [prediction, nextArrival] = await getPredictionFor(event)

      if (
        (status === "LIVE" || status === "TRACKING") &&
        "predictedEndAt" in prediction &&
        prediction.predictedEndAt
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

      if (
        status === "ENDED" &&
        nextArrival.available &&
        "nextExpectedAt" in nextArrival &&
        nextArrival.nextExpectedAt
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
  endingSoon.sort((a, b) => a.date.getTime() - b.date.getTime())
  returning.sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-4 text-center">
        <SectionEyebrow className="justify-center">Calendar</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          What&apos;s live, ending, or coming back.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          Every date below is either a live status we&apos;re watching
          right now, or a real estimate — from our own tracked history,
          or a few researched, published patterns where our own
          tracking (started 2026-08-04) doesn&apos;t have enough of a
          record yet. Never a guess with nothing behind it.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 space-y-14">
        <CalendarSection
          title="Live now"
          emptyMessage="Nothing limited-time is live right now."
        >
          {liveNow.map((row) => (
            <CalendarRowView key={row.id} row={row} isPremium={isPremium} />
          ))}
        </CalendarSection>

        <CalendarSection
          title="Estimated to end"
          emptyMessage="No live event has enough history yet for an estimate."
        >
          {endingSoon.map((row) => (
            <CalendarRowView key={row.id} row={row} isPremium={isPremium} />
          ))}
        </CalendarSection>

        <CalendarSection
          title="Typically returns"
          emptyMessage="No ended event has enough history yet to estimate a return."
        >
          {returning.map((row) => (
            <CalendarRowView key={row.id} row={row} isPremium={isPremium} />
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
}: {
  row: CalendarRow
  isPremium: boolean
}) {
  const dateGated = row.status !== "LIVE"

  const content = (
    <Link
      href={row.slug ? `/events/${row.slug}` : `/games/${row.game.slug}`}
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
        <p className="text-xs text-zinc-300">
          {row.date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </p>
        {row.researched && (
          <p className="text-[10px] text-zinc-600">researched</p>
        )}
      </div>
      <EventStatusBadge status={row.status} />
    </Link>
  )

  if (dateGated && !isPremium) {
    return <PremiumTeaser>{content}</PremiumTeaser>
  }

  return content
}
