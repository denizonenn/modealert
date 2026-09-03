import { NextRequest, NextResponse } from "next/server";

import { withErrorHandling } from "@/lib/api/with-error-handling";
import { verifyApiKey } from "@/lib/api/verify-api-key";
import { gameService } from "@/lib/services/game.service";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const auth = await verifyApiKey(request);
  if (!auth.ok) {
    return auth.response;
  }

  const games = await gameService.getAllGames();

  return NextResponse.json({
    data: games.map((game) => ({
      id: game.id,
      slug: game.slug,
      name: game.name,
      logo: game.logo,
      color: game.color,
    })),
  });
});
