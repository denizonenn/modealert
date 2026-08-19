import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { auth } from "@/auth";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { feedbackSchema } from "@/lib/validation/schemas";
import { createFeedback } from "@/lib/repositories/feedback.repository";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { buildAdminAlertHtml } from "@/lib/notifications/email/template";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger/logger";

const FEEDBACK_LIMIT = 5;
const FEEDBACK_WINDOW_MS = 60 * 60 * 1000;

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const ADMIN_RECIPIENTS = env.ADMIN_EMAILS
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const allowed = await checkRateLimit({
    key: `feedback:${session.user.id}`,
    limit: FEEDBACK_LIMIT,
    windowMs: FEEDBACK_WINDOW_MS,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too much feedback sent recently — try again later." },
      { status: 429 }
    );
  }

  const parsed = await parseJsonBody(request, feedbackSchema);

  if (parsed.error) {
    return parsed.error;
  }

  await createFeedback({
    userId: session.user.id,
    message: parsed.data.message,
  });

  // Best-effort — a broken alert email must never fail the actual
  // feedback submission, which is already safely persisted above.
  if (resend && ADMIN_RECIPIENTS.length > 0) {
    try {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: ADMIN_RECIPIENTS,
        subject: "New ModeAlert feedback",
        text: `From: ${session.user.email}\n\n${parsed.data.message}`,
        html: buildAdminAlertHtml(
          `Feedback from ${session.user.email}`,
          parsed.data.message
        ),
      });
    } catch (error) {
      logger.error("Failed to send feedback alert email", {
        error:
          error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ success: true });
});
