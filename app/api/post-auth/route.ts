import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { logger } from "@/lib/logger/logger";

// Single landing spot for every sign-in/sign-up path (Google, Discord,
// email magic link, credentials) so a brand-new account always goes
// through /onboarding once, no matter which entry point it signed up
// from. See docs/06_DECISIONS.md ADR-055 for the incident this fixes
// (a Google sign-up from /signin skipped onboarding entirely because
// that page's default callbackUrl was /dashboard).
export const GET = async (request: NextRequest) => {
  const session = await auth();

  const rawNext = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  // Only ever redirect to a same-origin relative path — never follow
  // a "next" value an attacker could use to bounce a signed-in user
  // off to an external site (open-redirect).
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//")
    ? rawNext
    : "/dashboard";

  const nextLocaleSegment = next.split("/")[1];
  const locale = isLocale(nextLocaleSegment)
    ? nextLocaleSegment
    : DEFAULT_LOCALE;

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL(`/${locale}/signin`, request.url)
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardedAt: true },
    });

    if (!user?.onboardedAt) {
      return NextResponse.redirect(
        new URL(`/${locale}/onboarding`, request.url)
      );
    }
  } catch (error) {
    // A failed lookup shouldn't strand a signed-in user on a blank
    // error page — fall through to their intended destination, same
    // as an already-onboarded user. Worst case they see /onboarding
    // again next sign-in if this was a transient DB hiccup.
    logger.error("post-auth onboarding lookup failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return NextResponse.redirect(new URL(next, request.url));
};
