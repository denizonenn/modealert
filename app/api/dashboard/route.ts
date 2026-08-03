import { NextResponse } from "next/server";

import { getDashboardStats } from "@/lib/helpers/getDashboardStats";

export async function GET() {
  const stats = await getDashboardStats();

  return NextResponse.json(stats);
}