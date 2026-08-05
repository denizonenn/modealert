"use client";

import { useOnboardingStore } from "@/stores/onboarding-store";
import { useGames } from "@/hooks/use-games";
import { Skeleton } from "@/components/shared/skeleton";
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games";
import SelectableGameCard from "../cards/selectable-game-card";

export default function GameSelector() {
  const { selectedGames, toggleGame } = useOnboardingStore();
  const { games, isLoading, error } = useGames();

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[140px] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-zinc-500">
        Failed to load games.
      </p>
    );
  }

  const trackableGames = games.filter((game) =>
    GAMES_WITH_PROVIDER.has(game.id)
  );

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {trackableGames.map((game) => (
        <SelectableGameCard
          key={game.id}
          game={game}
          selected={selectedGames.includes(game.id)}
          onClick={() => toggleGame(game.id)}
        />
      ))}
    </div>
  );
}
