import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { registerSchema } from "@/lib/validation/schemas";
import { analyticsService } from "@/lib/services/analytics.service";
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events";
import { sendWelcomeEmail } from "@/lib/notifications/email/welcome";

// Unauthenticated + creates a real DB row, so this is the most
// abuse-prone route in the app (mass fake account creation, email
// enumeration via the 409). 5/hour per IP is generous for a real
// signer-upper, tight for a script.
const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

export const POST = withErrorHandling(async (request: NextRequest) => {
  const ip = getClientIp(request);

  const allowed = await checkRateLimit({
    key: `register:${ip}`,
    limit: REGISTER_LIMIT,
    windowMs: REGISTER_WINDOW_MS,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const parsed = await parseJsonBody(request, registerSchema);

  if (parsed.error) {
    return parsed.error;
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });

  const alreadyExistsResponse = () =>
    NextResponse.json(
      {
        error:
          "An account with this email already exists. Sign in with Google or email instead.",
      },
      { status: 409 }
    );

  if (existing) {
    return alreadyExistsResponse();
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let user;

  try {
    user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
      },
    });
  } catch (error) {
    // The findUnique check above has a real race window (two
    // concurrent submits with the same email — a double-click, or two
    // tabs — can both pass it before either insert lands): without
    // this, the second request's unique-constraint violation would
    // bubble up as a generic 500 instead of the same friendly 409 the
    // first check gives, even though no double account is ever
    // actually created (the DB constraint itself is what's
    // protecting us — this only fixes the response, not the safety).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return alreadyExistsResponse();
    }

    throw error;
  }

  await analyticsService.record(
    user.id,
    ANALYTICS_EVENTS.SIGNUP_COMPLETED,
    "password"
  );

  // Best-effort — a failed welcome email should never fail signup
  // itself, the account is already created above.
  try {
    await sendWelcomeEmail(user.email);
  } catch (error) {
    console.error("Failed to send welcome email", error);
  }

  return NextResponse.json({ success: true });
});
