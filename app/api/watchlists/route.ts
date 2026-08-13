import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import {
  watchlistService,
  WatchlistLimitError,
} from "@/lib/services/watchlist.service";

export async function GET() {
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
}

export async function POST(
  request: NextRequest
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body =
    await request.json();

  try {
    const watchlist =
      await watchlistService.create(
        session.user.id,
        body.eventId
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
}

export async function DELETE(
  request: NextRequest
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body =
    await request.json();

  await watchlistService.delete(
    session.user.id,
    body.eventId
  );

  return NextResponse.json({
    success: true,
  });
}
