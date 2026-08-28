import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { PopularityHeatmap } from "@/components/statistics/popularity-heatmap"
import { MagnitudeBarList } from "@/components/statistics/magnitude-bar-list"
import { UptimeBars } from "@/components/statistics/uptime-bars"

import { globalStatisticsService } from "@/lib/services/global-statistics.service"
import { formatDuration, formatCount } from "@/lib/utils"
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries"

export const metadata: Metadata = {
  title: "Statistics",
  description:
    "Real, computed-from-history stats across every event ModeAlert tracks — most recurring events, average durations, and prediction accuracy.",
}

export default async function StatisticsPage() {
  const stats = await globalStatisticsService.get()
  const dict = await getDictionary()
  const locale = await getLocale()
  const t = dict.statisticsPage

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-zinc-400">{t.intro}</p>

        <div className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.popularityTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{t.popularityIntro}</p>

          <PopularityHeatmap
            games={stats.popularity.games}
            categories={stats.popularity.categories}
            cells={stats.popularity.cells}
            maxValue={stats.popularity.maxValue}
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.mostTrackedTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{t.mostTrackedIntro}</p>

          {stats.mostCommon.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              {t.mostTrackedEmpty}
            </p>
          ) : (
            <MagnitudeBarList
              items={stats.mostCommon.map((item) => ({
                key: item.eventId,
                label: item.title,
                sublabel: item.gameName,
                href: item.slug ? `/events/${item.slug}` : undefined,
                value: item.appearanceCount,
                valueLabel: t.seenTimes.replace(
                  "{count}",
                  String(item.appearanceCount)
                ),
              }))}
            />
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.avgDurationTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{t.avgDurationIntro}</p>

          {stats.averageDuration.sampleSize === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              {t.avgDurationEmpty}
            </p>
          ) : (
            <>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  {t.overallAllGames}
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatDuration(
                    stats.averageDuration.overallMs!,
                    locale
                  )}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  {(stats.averageDuration.sampleSize === 1
                    ? t.basedOnOccurrenceOne
                    : t.basedOnOccurrenceMany
                  ).replace(
                    "{count}",
                    String(stats.averageDuration.sampleSize)
                  )}
                </p>
              </div>

              <MagnitudeBarList
                items={stats.averageDuration.byGame.map((game) => ({
                  key: game.gameId,
                  label: game.gameName,
                  value: game.averageMs,
                  valueLabel: (game.sampleSize === 1
                    ? t.gameAvgSampleOne
                    : t.gameAvgSampleMany
                  )
                    .replace(
                      "{duration}",
                      formatDuration(game.averageMs, locale)
                    )
                    .replace("{count}", String(game.sampleSize)),
                }))}
              />
            </>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.predictionTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{t.predictionIntro}</p>

          {stats.predictionAccuracy.score === null ? (
            <p className="mt-4 text-sm text-zinc-500">
              {t.predictionEmpty}
            </p>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold">
                ~{stats.predictionAccuracy.score}%
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {(stats.predictionAccuracy.sampleSize === 1
                  ? t.basedOnPredictionOne
                  : t.basedOnPredictionMany
                ).replace(
                  "{count}",
                  String(stats.predictionAccuracy.sampleSize)
                )}
              </p>
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.uptimeTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {t.uptimeIntro.replace(
              "{days}",
              String(stats.providerUptime.windowDays)
            )}
          </p>

          {stats.providerUptime.providers.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">{t.uptimeEmpty}</p>
          ) : (
            <UptimeBars providers={stats.providerUptime.providers} />
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.notificationsTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {t.notificationsIntro}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                {t.allTime}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCount(stats.notifications.total)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                {t.last30Days}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCount(stats.notifications.last30Days)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                {t.successRateTitle}
              </p>
              {stats.notifications.successRate30d === null ? (
                <p className="mt-1 text-sm text-zinc-500">
                  {t.noSendAttempts}
                </p>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-semibold">
                    {stats.notifications.successRate30d}%
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {t.sentFailed
                      .replace(
                        "{sent}",
                        String(stats.notifications.last30Days)
                      )
                      .replace(
                        "{failed}",
                        String(stats.notifications.failedLast30Days)
                      )}
                  </p>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                {t.reportedWrongTitle}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {t.reportedWrongIntro}
              </p>
              {stats.notifications.falsePositives.rate === null ? (
                <p className="mt-2 text-sm text-zinc-500">
                  {t.noNotificationsSent}
                </p>
              ) : (
                <>
                  <p className="mt-2 text-2xl font-semibold">
                    {stats.notifications.falsePositives.rate}%
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {t.ofTotalSent
                      .replace(
                        "{reported}",
                        String(
                          stats.notifications.falsePositives.totalReported
                        )
                      )
                      .replace(
                        "{total}",
                        String(stats.notifications.total)
                      )}
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
