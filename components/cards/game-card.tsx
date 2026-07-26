import { Game } from "@/types/game";

interface Props {
  game: Game;
}

export default function GameCard({
  game,
}: Props) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black text-3xl">
          {game.logo}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">
            {game.name}
          </h3>

          <p className="text-sm text-zinc-400">
            {game.supportedEvents} supported events
          </p>
        </div>

        <div className="text-right">
          <div className="font-semibold">
            {game.activeUsers}
          </div>

          <div className="text-xs text-zinc-500">
            tracking
          </div>
        </div>
      </div>
    </div>
  );
}