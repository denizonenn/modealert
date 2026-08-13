import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import { notificationService } from "@/lib/services/notification.service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const notifications =
    await notificationService.getByUser(session.user.id);

  return NextResponse.json(notifications);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (body.id && body.falsePositive) {
    await notificationService.reportFalsePositive(
      body.id,
      session.user.id
    );

    return NextResponse.json({
      success: true,
    });
  }

  if (body.id) {
    await notificationService.markRead(
      body.id,
      session.user.id
    );

    return NextResponse.json({
      success: true,
    });
  }

  await notificationService.markAllRead(session.user.id);

  return NextResponse.json({
    success: true,
  });
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

  const body = await request.json();

  await notificationService.delete(
    body.id,
    session.user.id
  );

  return NextResponse.json({
    success: true,
  });
}
