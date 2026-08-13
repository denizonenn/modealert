import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import {
  watchlistService,
  WatchlistLimitError,
} from "@/lib/services/watchlist.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { watchlistEventSchema } from "@/lib/validation/schemas";

export const GET = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const watchlists =
    await watchlistService.getByUser(
      session.user.id
    );

  return NextResponse.json(
    watchlists
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

  const parsed = await parseJsonBody(request, watchlistEventSchema);

  if (parsed.error) {
    return parsed.error;
  }

  try {
    const watchlist =
      await watchlistService.create(
        session.user.id,
        parsed.data.eventId
      );

    return NextResponse.json(
      watchlist,
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof WatchlistLimitError) {
      return NextResponse.json(
        { error: "WATCHLIST_LIMIT_REACHED" },
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

  const parsed = await parseJsonBody(request, watchlistEventSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await watchlistService.delete(
    session.user.id,
    parsed.data.eventId
  );

  return NextResponse.json({
    success: true,
  });
});
