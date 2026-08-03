import { gameService } from "@/lib/services/game.service";

export async function getGame(id: string) {
  return gameService.getById(id);
}