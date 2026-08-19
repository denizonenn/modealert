import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";

const EMBED_COLOR = 0x9333ea;

export const POST = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
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
