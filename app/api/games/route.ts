import { NextResponse } from "next/server";

import { gameService } from "@/lib/services/game.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";

export const GET = withErrorHandling(async () => {
  const games =
    await gameService.getAllGames();

  return NextResponse.json(games);
});