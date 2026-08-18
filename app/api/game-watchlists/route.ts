import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import {
  gameWatchlistService,
  GameWatchlistPremiumRequiredError,
} from "@/lib/services/game-watchlist.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { gameWatchlistSchema } from "@/lib/validation/schemas";

export const GET = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const gameWatchlists =
    await gameWatchlistService.getByUser(
      session.user.id
    );

  return NextResponse.json(
    gameWatchlists
  );
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, gameWatchlistSchema);

  if (parsed.error) {
    return parsed.error;
  }

  try {
    const gameWatchlist =
      await gameWatchlistService.follow(
        session.user.id,
        parsed.data.gameId
      );

    return NextResponse.json(
      gameWatchlist,
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof GameWatchlistPremiumRequiredError) {
      return NextResponse.json(
        { error: "PREMIUM_REQUIRED" },
        { status: 402 }
      );
    }

    throw error;
  }
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, gameWatchlistSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await gameWatchlistService.unfollow(
    session.user.id,
    parsed.data.gameId
  );

  return NextResponse.json({
    success: true,
  });
});
