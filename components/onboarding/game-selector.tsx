"use client";

import { useEffect, useState } from "react";

import { Game } from "@/types/game";

import { gameService } from "@/lib/services/game.service";

import { useOnboardingStore } from "@/stores/onboarding-store";

import SelectableGameCard from "../cards/selectable-game-card";

export default function GameSelector() {
  const {
    selectedGames,
    toggleGame,
  } = useOnboardingStore();

  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    gameService
      .getAllGames()
      .then(setGames);
  }, []);

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
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