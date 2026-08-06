import type { Metadata } from "next"
import Link from "next/link"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"

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
            Most tracked events
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Events ranked by how many times we&apos;ve seen them occur.
          </p>

          <div className="mt-4 space-y-2">
            {stats.mostCommon.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No history recorded yet — check back after the next sync.
              </p>
            ) : (
              stats.mostCommon.map((item, index) => (
                <div
                  key={item.eventId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-zinc-600">{index + 1}</span>
                    {item.slug ? (
                      <Link
                        href={`/events/${item.slug}`}
                        className="font-medium hover:text-zinc-300"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span className="font-medium">{item.title}</span>
                    )}
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500">{item.gameName}</span>
                  </div>

                  <span className="text-xs text-zinc-500">
                    seen {item.appearanceCount}×
                  </span>
                </div>
              ))
            )}
          </div>
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

              <div className="mt-3 space-y-2">
                {stats.averageDuration.byGame.map((game) => (
                  <div
                    key={game.gameId}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <span className="text-zinc-300">{game.gameName}</span>
                    <span className="text-zinc-500">
                      {formatDuration(game.averageMs)} avg · {game.sampleSize}{" "}
                      sample{game.sampleSize === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
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
            <div className="mt-4 space-y-2">
              {stats.providerUptime.providers.map((provider) => (
                <div
                  key={provider.providerId}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <span className="text-zinc-300">
                    {provider.providerName}
                  </span>
                  <span className="text-zinc-500">
                    {provider.uptimePercent}% · {provider.sampleSize} check
                    {provider.sampleSize === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
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
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
