import type { Metadata } from "next"
import Link from "next/link"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { GamesGridSearch } from "@/components/games/games-grid-search"
import { GamesKeyArtCarousel } from "@/components/games/games-key-art-carousel"

import { gameService } from "@/lib/services/game.service"
import { eventQueryService } from "@/lib/services/event-query.service"
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"
import { findGameKeyArt, placeholderGameArt } from "@/lib/constants/game-key-art"
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary()

  return {
    title: dict.games.metaTitle,
    description: `ModeAlert tracks ${GAMES_WITH_PROVIDER.size} games today — League of Legends, Valorant, Destiny 2, TFT, Fortnite, Warframe, Path of Exile, Helldivers 2, Foxhole, PUBG, PlanetSide 2, Final Fantasy XIV, and EA Sports FC — limited-time modes, seasonal events, Night Markets, raid rotations, and special events, all from one watchlist.`,
  }
}

export default async function GamesPage() {
  const [games, events, dict, locale] = await Promise.all([
    gameService.getAllGames(),
    eventQueryService.getAll(),
    getDictionary(),
    getLocale(),
  ])

  const eventsByGame: Record<
    string,
    { id: string; title: string; status: string; slug: string | null }[]
  > = {}

  for (const event of events) {
    ;(eventsByGame[event.gameId] ??= []).push({
      id: event.id,
      title: event.title,
      status: event.status,
      slug: event.slug,
    })
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-4 text-center">
        <SectionEyebrow className="justify-center">
          {dict.games.eyebrow}
        </SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          {dict.games.title}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          {dict.games.intro}
        </p>
      </section>

      {games.length > 0 && (
        <section className="pt-10">
          <GamesKeyArtCarousel
            games={games.map((game) => ({
              id: game.id,
              name: game.name,
              shortName: game.shortName,
              color: game.color,
              supportedEvents: game.supportedEvents,
              image:
                findGameKeyArt(game.id) ??
                placeholderGameArt(game.shortName, game.color),
            }))}
            eventsByGame={eventsByGame}
          />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-16">
        {games.length === 0 ? (
          <p className="text-center text-zinc-500">
            {dict.games.noGames}
          </p>
        ) : (
          <GamesGridSearch games={games} />
        )}
      </section>

      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <SectionEyebrow className="justify-center">
            {dict.games.pluginEyebrow}
          </SectionEyebrow>

          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {dict.games.pluginTitle}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            {dict.games.pluginIntro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          {dict.games.ctaTitle}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          {dict.games.ctaIntro}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href={`/${locale}/onboarding`}>
            <Button
              size="lg"
              className="h-12 rounded-full bg-gradient-brand px-8 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
            >
              {dict.games.startTracking}
            </Button>
          </Link>

          <Link href={`/${locale}/features`}>
            <InteractiveHoverButton
              text={dict.games.seeAllFeatures}
              className="h-12 w-auto rounded-full border-white/15 bg-white/5 px-8 text-white"
            />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
