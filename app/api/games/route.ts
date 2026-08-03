import { gameService } from "@/lib/services/game.service";

export async function GET() {
  const games =
    await gameService.getAllGames();

  return Response.json(games);
}