import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import { notificationService } from "@/lib/services/notification.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import {
  notificationActionSchema,
  notificationIdSchema,
} from "@/lib/validation/schemas";

export const GET = withErrorHandling(async () => {
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
});

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, notificationActionSchema);

  if (parsed.error) {
    return parsed.error;
  }

  const { id, falsePositive } = parsed.data;

  if (id && falsePositive) {
    await notificationService.reportFalsePositive(
      id,
      session.user.id
    );

    return NextResponse.json({
      success: true,
    });
  }

  if (id) {
    await notificationService.markRead(
      id,
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
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseJsonBody(request, notificationIdSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await notificationService.delete(
    parsed.data.id,
    session.user.id
  );

  return NextResponse.json({
    success: true,
  });
});
