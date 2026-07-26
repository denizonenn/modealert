import { games } from "@/lib/data/games";
import GameCard from "@/components/cards/game-card";

export function SupportedGames() {
  return (
    <section
      id="games"
      className="border-y border-white/10 bg-white/[0.02]"
    >
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Supported Games
          </p>

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

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
            />
          ))}
        </div>
      </div>
    </section>
  );
}