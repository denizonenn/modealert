import { games } from "@/lib/data/games";

export function getGames() {
  return games;
}

export function getGameById(id: string) {
  return games.find((game) => game.id === id);
}

export function getFeaturedGames() {
  return games.filter((game) => game.featured);
}