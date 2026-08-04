"use client";

import { Check } from "lucide-react";
import { Game } from "@/types/game";
import { GameIcon } from "@/components/shared/game-icon";

interface Props {
  game: Game;
  selected: boolean;
  onClick: () => void;
}

export default function SelectableGameCard({
  game,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border p-6 transition hover:scale-[1.03]
      ${
        selected
          ? "border-white bg-white/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <GameIcon
          gameId={game.id}
          logo={game.logo}
          color={game.color}
          size="lg"
        />

        <p className="font-medium">
          {game.name}
        </p>
      </div>

      {selected && (
        <div className="absolute right-3 top-3 rounded-full bg-white p-1 text-black">
          <Check size={16} />
        </div>
      )}
    </button>
  );
}
