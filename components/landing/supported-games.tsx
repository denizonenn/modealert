"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import GameCard from "@/components/cards/game-card";
import { Skeleton } from "@/components/shared/skeleton";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";

import { useGames } from "@/hooks/use-games";
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games";

export function SupportedGames() {
  const {
    games: allGames,
    isLoading,
    error,
  } = useGames();

  const games = allGames.filter((game) =>
    GAMES_WITH_PROVIDER.has(game.id)
  );

  return (
    <section
      id="games"
      className="border-y border-white/10 bg-white/[0.02]"
    >
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <SectionEyebrow className="justify-center">
            Supported Games
          </SectionEyebrow>

          <h2 className="mt-4 text-4xl font-bold">
            One platform.
            <br />
            Every game event.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            Track limited-time modes, seasonal events,
            Night Markets, Twitch Drops,
            beta access, special rotations
            and much more.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[172px] w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-14 text-center text-zinc-500">
            Failed to load games.
          </p>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                index={index}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white"
          >
            See all games
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
