import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { getWatchlistsByUser } from "@/lib/repositories/watchlist.repository";
import { getGameWatchlistsByUser } from "@/lib/repositories/game-watchlist.repository";
import { getNotificationsByUser } from "@/lib/repositories/notification.repository";

// GDPR Art. 20 (data portability) — account deletion (Art. 17) already
// existed, this was the missing "give me a copy of what you have on
// me" half. Everything here is data the user can already see spread
// across Settings/Dashboard/Notifications; this just puts it in one
// downloadable file.
export const GET = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  const [account, watchlist, gameWatchlist, notifications] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          emailOptOut: true,
          discordWebhookUrl: true,
          plan: true,
          subscriptionStatus: true,
          subscriptionRenewsAt: true,
        },
      }),
      getWatchlistsByUser(userId),
      getGameWatchlistsByUser(userId),
      getNotificationsByUser(userId),
    ]);

  if (!account) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  const payload = {
    exportedAt: new Date().toISOString(),

    account: {
      email: account.email,
      name: account.name,
      emailNotificationsEnabled: !account.emailOptOut,
      discordWebhookUrl: account.discordWebhookUrl,
      plan: account.plan,
      subscriptionStatus: account.subscriptionStatus,
      subscriptionRenewsAt: account.subscriptionRenewsAt,
    },

    watchlist: watchlist.map((entry) => ({
      eventTitle: entry.event.title,
      game: entry.event.game.name,
      status: entry.event.status,
    })),

    gameWatchlist: gameWatchlist.map((entry) => ({
      game: entry.game.name,
      followedSince: entry.createdAt,
    })),

    notifications: notifications.map((notification) => ({
      title: notification.title,
      message: notification.message,
      channel: notification.channel,
      read: notification.read,
      sentAt: notification.createdAt,
      reportedAsWrong: notification.falsePositiveReportedAt !== null,
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="modealert-data-export.json"`,
    },
  });
});
