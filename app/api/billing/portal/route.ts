import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { billingService } from "@/lib/services/billing.service";
import { withErrorHandling } from "@/lib/api/with-error-handling";

// "Manage subscription" — mints a short-lived Paddle customer portal
// session for the signed-in user and redirects there (update card,
// cancel, invoices; all hosted by Paddle). The Paddle customer id is
// resolved server-side from the session's own user row; nothing the
// client sends is used to pick the customer.
export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", request.url), 303);
  }

  const portalUrl = await billingService.getPortalUrl(session.user.id);

  if (!portalUrl) {
    return NextResponse.redirect(
      new URL("/dashboard/settings", request.url),
      303
    );
  }

  return NextResponse.redirect(portalUrl, 303);
});
