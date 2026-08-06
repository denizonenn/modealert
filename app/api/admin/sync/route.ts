import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { providerSyncService } from "@/lib/services/provider-sync.service";

export async function POST() {
  const session = await auth();

  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const results = await providerSyncService.syncAll();

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
