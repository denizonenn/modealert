import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap } from "lucide-react";
import { DashboardPreview, type PreviewEvent } from "./dashboard-preview"
import { StatsBar } from "./stats-bar"
import Link from "next/link"
import { ModeRotator } from "./mode-rotator"
import KineticGrid from "@/components/ui/kinetic-grid"

import { eventQueryService } from "@/lib/services/event-query.service"
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"
import { categorySortKey } from "@/lib/constants/event-category"

const STATUS_ORDER: Record<string, number> = {
  LIVE: 0,
  UPCOMING: 1,
  TRACKING: 2,
  ENDED: 3,
}

// Category dominates the pick — a real played event (URF/Arena's
// battle-pass window, a PoE league, ...) represents the game better
// than an always-on "Platform Status"/"Champion Rotation" row, even
// if the real event has since ended and the noise row is live.
function previewRank(event: {
  status: string
  category: string
  isLimitedTime: boolean
}): number {
  return categorySortKey(
    event.category,
    event.isLimitedTime,
    STATUS_ORDER[event.status] ?? 9
  )
}

async function getPreviewData(): Promise<{
  events: PreviewEvent[]
  monitoredCount: number
  gameCount: number
}> {
  const events = await eventQueryService.getAll()

  const bestPerGame = new Map<string, (typeof events)[number]>()

  for (const event of events) {
    const existing = bestPerGame.get(event.gameId)

    if (!existing || previewRank(event) < previewRank(existing)) {
      bestPerGame.set(event.gameId, event)
    }
  }

  const previewEvents: PreviewEvent[] = Array.from(bestPerGame.values())
    .sort((a, b) => previewRank(a) - previewRank(b))
    .slice(0, 3)
    .map((event) => ({
      gameId: event.gameId,
      game: event.game.name,
      mode: event.title,
      status: event.status,
      color: event.game.color,
    }))

  const monitoredCount = events.filter(
    (event) => event.status !== "ENDED"
  ).length

  return {
    events: previewEvents,
    monitoredCount,
    gameCount: GAMES_WITH_PROVIDER.size,
  }
}

export async function Hero() {
  const { events, monitoredCount, gameCount } = await getPreviewData()

  return (
    <KineticGrid globalColor="brand" className="text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_15%,rgba(0,0,0,0.4),transparent_70%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
        <div className="mb-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live — {gameCount} games / {monitoredCount} events tracked
        </div>

        <Badge className="mb-6 border border-white/10 bg-white/10 text-white hover:bg-white/15">
          <Zap className="mr-2 h-3 w-3" /> Daily mode detection
        </Badge>
        <ModeRotator />

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Never miss your{" "}
          <span className="text-gradient-brand">
            favorite game modes
          </span>{" "}
          again.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
          Get instant alerts when URF, Arena, Night Market, Iron Banner and other limited-time events go live.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/onboarding">
            <Button className="h-12 rounded-full bg-gradient-brand px-8 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
              Start Tracking
            </Button>
          </Link>

          <Button size="lg" variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10">
            View supported games
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <StatsBar gameCount={gameCount} eventCount={monitoredCount} />

        <div className="relative w-full max-w-6xl">
          <span className="absolute -top-2 -left-2 h-6 w-6 border-t-2 border-l-2 border-white/25" />
          <span className="absolute -top-2 -right-2 h-6 w-6 border-t-2 border-r-2 border-white/25" />
          <span className="absolute -bottom-2 -left-2 h-6 w-6 border-b-2 border-l-2 border-white/25" />
          <span className="absolute -bottom-2 -right-2 h-6 w-6 border-b-2 border-r-2 border-white/25" />

          <DashboardPreview events={events} monitoredCount={monitoredCount} />
        </div>
      </div>
    </KineticGrid>
  )
}
