import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getDashboardStats } from "@/lib/helpers/getDashboardStats";

export async function GET(
  request: NextRequest
) {
  const userId =
    request.nextUrl.searchParams.get("userId") ??
    "demo";

  const stats = await getDashboardStats(userId);

  return NextResponse.json(stats);
}
