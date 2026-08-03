import {
  NextResponse,
} from "next/server";

import {
  getProviders,
} from "@/lib/providers/core/registry";

export async function GET() {
  const providers =
    getProviders().map(
      (provider) => ({
        id: provider.id,

        name: provider.name,

        enabled:
          provider.enabled,
      })
    );

  return NextResponse.json({
    success: true,

    providers,
  });
}