import {
  NextRequest,
  NextResponse,
} from "next/server";

import { watchlistService } from "@/lib/services/watchlist.service";

export async function GET(
  request: NextRequest
) {
  const userId =
    request.nextUrl.searchParams.get("userId") ??
    "demo";

  const watchlists =
    await watchlistService.getByUser(
      userId
    );

  return NextResponse.json(
    watchlists
  );
}

export async function POST(
  request: NextRequest
) {
  const body =
    await request.json();

  const watchlist =
    await watchlistService.create(
      body.userId,
      body.eventId
    );

  return NextResponse.json(
    watchlist,
    {
      status: 201,
    }
  );
}

export async function DELETE(
  request: NextRequest
) {
  const body =
    await request.json();

  await watchlistService.delete(
    body.userId,
    body.eventId
  );

  return NextResponse.json({
    success: true,
  });
}