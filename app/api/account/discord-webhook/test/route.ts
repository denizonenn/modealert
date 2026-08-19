import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { checkRateLimit } from "@/lib/security/rate-limit";

const EMBED_COLOR = 0x9333ea;

// Unlike the real notification path (only fires when a watchlisted
// event actually changes, at most once per daily cron run), this
// button lets a signed-in user trigger an on-demand POST to an
// arbitrary URL directly — without a limit, it's a free repeat-POST
// tool against any endpoint. Same Postgres-backed limiter already
// used for login/register (ADR-045).
const TEST_SEND_LIMIT = 5;
const TEST_SEND_WINDOW_MS = 10 * 60 * 1000;

export const POST = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const allowed = await checkRateLimit({
    key: `discord-webhook-test:${session.user.id}`,
    limit: TEST_SEND_LIMIT,
    windowMs: TEST_SEND_WINDOW_MS,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many test messages — try again in a few minutes." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { discordWebhookUrl: true },
  });

  if (!user?.discordWebhookUrl) {
    return NextResponse.json(
      { error: "No Discord webhook saved yet." },
      { status: 400 }
    );
  }

  const response = await fetch(user.discordWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "Test notification",
          description:
            "This is a test message from ModeAlert — if you're seeing this, your Discord webhook is set up correctly.",
          color: EMBED_COLOR,
          footer: { text: "ModeAlert" },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        error: `Discord rejected the test message (HTTP ${response.status}). Double-check the webhook URL.`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
});
