"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventStatusBadge } from "@/components/shared/event-status-badge"
import { Skeleton } from "@/components/shared/skeleton"
import { AllGamesStatus } from "@/components/live/all-games-status"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface LiveEvent {
  id: string
  title: string
  status: "LIVE" | "UPCOMING" | "TRACKING" | "ENDED"
  startDate: string
  endDate: string
  hubType: string
}

interface CurrentStatusResponse {
  success: boolean
  liveEvents?: LiveEvent[]
  upcomingEvents?: LiveEvent[]
  pbeCandidates?: LiveEvent[]
  pbeCheckFailed?: boolean
  checkedAt?: string
  error?: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function EventRow({ event, index = 0 }: { event: LiveEvent; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition-colors hover:border-white/20"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{event.title}</p>
        <p className="text-xs text-zinc-500">{event.hubType}</p>
      </div>
      <div className="shrink-0 text-right text-xs text-zinc-400">
        <p>Starts: {formatDate(event.startDate)}</p>
        <p>Ends: {formatDate(event.endDate)}</p>
      </div>
    </motion.div>
  )
}

function SectionSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-[52px] w-full rounded-xl" />
      <Skeleton className="h-[52px] w-full rounded-xl" />
      <Skeleton className="h-[52px] w-full rounded-xl" />
    </div>
  )
}

export default function LivePage() {
  const [data, setData] = useState<CurrentStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)

    try {
      const response = await fetch("/api/providers/communitydragon/current")
      const json: CurrentStatusResponse = await response.json()
      setData(json)
    } catch {
      setData({ success: false, error: "Request failed." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  const isInitialLoad = loading && !data

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            All Games — Live Status
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            What&apos;s Happening Right Now?
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            The current status of every tracked mode across every game —
            live, upcoming, tracking, or ended.
          </p>
        </motion.div>

        <div className="mt-8">
          <AllGamesStatus />
        </div>

        <div className="mt-16 border-t border-white/10 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                CommunityDragon — Live Check
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Early Signal Detail for League of Legends
              </h2>
            </div>

            <Button
              variant="ghost"
              className="border border-white/10 text-white hover:bg-white/10"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh
            </Button>
          </motion.div>

          {data?.checkedAt && (
            <p className="mt-2 text-xs text-zinc-500">
              Last checked: {formatDate(data.checkedAt)} · Source: raw.communitydragon.org (live + pbe)
            </p>
          )}

        {data && !data.success && (
          <Card className="mt-8 border-red-500/30 bg-red-500/10 text-white">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-sm">{data.error ?? "Couldn't fetch data."}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EventStatusBadge status="LIVE" />
                Live Right Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isInitialLoad ? (
                <SectionSkeleton />
              ) : data?.liveEvents?.length ? (
                <div className="space-y-2">
                  {data.liveEvents.map((event, index) => (
                    <EventRow key={event.id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No live events right now.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EventStatusBadge status="UPCOMING" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isInitialLoad ? (
                <SectionSkeleton />
              ) : data?.upcomingEvents?.length ? (
                <div className="space-y-2">
                  {data.upcomingEvents.map((event, index) => (
                    <EventRow key={event.id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No upcoming events scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-400 text-amber-400">
                PBE
              </Badge>
              On PBE But Not Live Yet (Early Signal)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.pbeCheckFailed ? (
              <p className="text-sm text-zinc-500">
                The PBE check failed just now (the PBE server may be temporarily unreachable).
              </p>
            ) : isInitialLoad ? (
              <SectionSkeleton />
            ) : data?.pbeCandidates?.length ? (
              <div className="space-y-2">
                {data.pbeCandidates.map((event, index) => (
                  <EventRow key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Nothing is on PBE that isn&apos;t already live. That&apos;s normal — CDragon&apos;s
                event-hub file mostly covers pre-planned content like season passes / battle
                passes.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>URF Status — Why Isn&apos;t It Shown Here?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>
              URF (Ultra Rapid Fire) is always defined in CommunityDragon&apos;s{" "}
              <code className="rounded bg-black/40 px-1">queues.json</code> file — that&apos;s not
              an &quot;active&quot; signal, just &quot;this queue type exists.&quot; Riot never
              publishes when URF is actually open in any public or datamined file ahead of time;
              they only announce it in patch notes or an in-client banner once the rotation is
              already live.
            </p>
            <p>
              So a real &quot;early warning&quot; for URF isn&apos;t technically possible right
              now — that&apos;s not a gap on our end, it&apos;s that Riot never publishes this data
              anywhere in advance. The PBE/Live comparison above gives a real early signal for
              modes that have their own &quot;hub file,&quot; like Arena or Swarm.
            </p>
          </CardContent>
        </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
