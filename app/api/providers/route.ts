import {
  NextResponse,
} from "next/server";

import {
  getProviders,
} from "@/lib/providers/core/registry";
import { withErrorHandling } from "@/lib/api/with-error-handling";

export const GET = withErrorHandling(async () => {
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
});