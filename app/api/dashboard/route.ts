import {
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import { getDashboardStats } from "@/lib/helpers/getDashboardStats";
import { withErrorHandling } from "@/lib/api/with-error-handling";

export const GET = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const stats = await getDashboardStats(session.user.id);

  return NextResponse.json(stats);
});
