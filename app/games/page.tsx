import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import GameCard from "@/components/cards/game-card"

import { gameService } from "@/lib/services/game.service"

export const metadata: Metadata = {
  title: "Supported Games",
  description:
    "ModeAlert tracks League of Legends, Valorant, and Fortnite today — limited-time modes, seasonal events, Night Markets, Twitch Drops, and special rotations, all from one watchlist.",
}

export default async function GamesPage() {
  const games = await gameService.getAllGames()

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-4 text-center">
        <SectionEyebrow className="justify-center">
          Supported Games
        </SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          One watchlist. Every game event.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          Track limited-time modes, seasonal events, Night Markets, Twitch
          Drops, beta access, special rotations and much more — across every
          game below.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {games.length === 0 ? (
          <p className="text-center text-zinc-500">
            No games available right now — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <SectionEyebrow className="justify-center">
            More games, over time
          </SectionEyebrow>

          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Every game is a plugin.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            ModeAlert&apos;s tracking system is built so adding a new game
            doesn&apos;t require rebuilding anything — new titles get added
            as new tracking sources come online.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Pick your games, get notified.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Free during early access. Set up your first alert in under a
          minute.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/onboarding">
            <Button
              size="lg"
              className="h-12 rounded-full bg-gradient-brand px-8 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
            >
              Start Tracking
            </Button>
          </Link>

          <Link href="/features">
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10"
            >
              See all features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
