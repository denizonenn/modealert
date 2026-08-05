import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import { watchlistService } from "@/lib/services/watchlist.service";

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
