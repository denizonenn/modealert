"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import GameCard from "@/components/cards/game-card";

import type { Game } from "@/types/game";

interface Props {
  games: Game[];
}

export function GamesGridSearch({ games }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return games;
    }

    return games.filter((game) =>
      game.name.toLowerCase().includes(q)
    );
  }, [games, query]);

  return (
    <div>
      <div className="mx-auto mb-8 max-w-md">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 transition-colors focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/15">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />

          <input
            type="text"
            placeholder="Search games..."
            aria-label="Search games"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-zinc-500">
          No games match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
