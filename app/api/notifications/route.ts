import {
  NextRequest,
  NextResponse,
} from "next/server";

import { notificationService } from "@/lib/services/notification.service";

export async function GET(request: NextRequest) {
  const userId =
    request.nextUrl.searchParams.get("userId") ??
    "demo";

  const notifications =
    await notificationService.getByUser(userId);

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const notification =
    await notificationService.create(body);

  return NextResponse.json(notification);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  if (body.id) {
    await notificationService.markRead(body.id);

    return NextResponse.json({
      success: true,
    });
  }

  if (body.userId) {
    await notificationService.markAllRead(
      body.userId
    );

    return NextResponse.json({
      success: true,
    });
  }

  return NextResponse.json(
    {
      error: "Missing id or userId",
    },
    {
      status: 400,
    }
  );
}

export async function DELETE(
  request: NextRequest
) {
  const body = await request.json();

  await notificationService.delete(body.id);

  return NextResponse.json({
    success: true,
  });
}