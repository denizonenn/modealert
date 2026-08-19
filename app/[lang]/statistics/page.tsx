import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { PopularityHeatmap } from "@/components/statistics/popularity-heatmap"
import { MagnitudeBarList } from "@/components/statistics/magnitude-bar-list"
import { UptimeBars } from "@/components/statistics/uptime-bars"

import { globalStatisticsService } from "@/lib/services/global-statistics.service"
import { formatDuration, formatCount } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Statistics",
  description:
    "Real, computed-from-history stats across every event ModeAlert tracks — most recurring events, average durations, and prediction accuracy.",
}

export default async function StatisticsPage() {
  const stats = await globalStatisticsService.get()

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <SectionEyebrow>Statistics</SectionEyebrow>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Site-wide stats
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-zinc-400">
          Computed directly from real tracking history — no estimates or
          placeholder numbers. History tracking started 2026-08-04, so
          some numbers below will fill in as more events complete.
        </p>

        <div className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Popularity
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Real watchlist counts by game and category — how many people
            are actually tracking each kind of event, not an estimate.
          </p>

          <PopularityHeatmap
            games={stats.popularity.games}
            categories={stats.popularity.categories}
            cells={stats.popularity.cells}
            maxValue={stats.popularity.maxValue}
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Most tracked events
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Events ranked by how many times we&apos;ve seen them occur.
          </p>

          {stats.mostCommon.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              No history recorded yet — check back after the next sync.
            </p>
          ) : (
            <MagnitudeBarList
              items={stats.mostCommon.map((item) => ({
                key: item.eventId,
                label: item.title,
                sublabel: item.gameName,
                href: item.slug ? `/events/${item.slug}` : undefined,
                value: item.appearanceCount,
                valueLabel: `seen ${item.appearanceCount}×`,
              }))}
            />
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Average duration
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Across every event that has fully completed (start to end)
            at least once.
          </p>

          {stats.averageDuration.sampleSize === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              Not enough events have completed yet to compute this.
            </p>
          ) : (
            <>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Overall, all games
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatDuration(
                    stats.averageDuration.overallMs!
                  )}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  based on {stats.averageDuration.sampleSize} completed
                  occurrence
                  {stats.averageDuration.sampleSize === 1 ? "" : "s"}
                </p>
              </div>

              <MagnitudeBarList
                items={stats.averageDuration.byGame.map((game) => ({
                  key: game.gameId,
                  label: game.gameName,
                  value: game.averageMs,
                  valueLabel: `${formatDuration(game.averageMs)} avg · ${game.sampleSize} sample${game.sampleSize === 1 ? "" : "s"}`,
                }))}
              />
            </>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Prediction accuracy
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            How close our end-time predictions land to what actually
            happened, tested retrospectively against real history.
          </p>

          {stats.predictionAccuracy.score === null ? (
            <p className="mt-4 text-sm text-zinc-500">
              Not enough events have recurred and completed yet to score
              this.
            </p>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold">
                ~{stats.predictionAccuracy.score}%
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                based on {stats.predictionAccuracy.sampleSize} retrospective
                prediction
                {stats.predictionAccuracy.sampleSize === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Provider uptime
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Share of sync attempts that succeeded per provider, last{" "}
            {stats.providerUptime.windowDays} days. Recorded on every sync —
            data starts filling in from 2026-08-06.
          </p>

          {stats.providerUptime.providers.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              No health checks recorded yet — check back after the next
              sync.
            </p>
          ) : (
            <UptimeBars providers={stats.providerUptime.providers} />
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Every send attempt (success or failure, all channels) is
            recorded, so the success rate below is real, not just a count
            of what worked.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                All time
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCount(stats.notifications.total)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Last 30 days
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCount(stats.notifications.last30Days)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Success rate, last 30 days
              </p>
              {stats.notifications.successRate30d === null ? (
                <p className="mt-1 text-sm text-zinc-500">
                  No send attempts in the last 30 days.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-semibold">
                    {stats.notifications.successRate30d}%
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {stats.notifications.last30Days} sent,{" "}
                    {stats.notifications.failedLast30Days} failed
                  </p>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Reported as wrong
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Real user reports — a recipient flagged a specific
                notification as inaccurate, not an inferred guess.
              </p>
              {stats.notifications.falsePositives.rate === null ? (
                <p className="mt-2 text-sm text-zinc-500">
                  No notifications sent yet.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-2xl font-semibold">
                    {stats.notifications.falsePositives.rate}%
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {stats.notifications.falsePositives.totalReported}{" "}
                    of {stats.notifications.total} notifications ever
                    sent
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
