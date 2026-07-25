import { games } from "@/lib/data/games"

export function getGame(id: string) {
  return games.find((game) => game.id === id)
}