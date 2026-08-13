import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { registerSchema } from "@/lib/validation/schemas";

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

  if (existing) {
    return NextResponse.json(
      {
        error:
          "An account with this email already exists. Sign in with Google or email instead.",
      },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
    },
  });

  return NextResponse.json({ success: true });
});
