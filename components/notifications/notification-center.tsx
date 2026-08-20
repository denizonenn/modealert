"use client";

import Link from "next/link";

import NotificationItem from "./notification-item";
import EmptyState from "./empty-state";
import { Skeleton } from "@/components/shared/skeleton";

import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    reportFalsePositive,
  } = useNotifications();

  return (
    <section className="flex max-h-[28rem] flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="font-semibold">Notifications</h2>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead()}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-1 pb-1">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              message={notification.message}
              channel={notification.channel}
              read={notification.read}
              createdAt={notification.createdAt}
              falsePositiveReportedAt={
                notification.falsePositiveReportedAt
              }
              onMarkRead={() => markRead(notification.id)}
              onReportFalsePositive={() =>
                reportFalsePositive(notification.id)
              }
            />
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <Link
          href="/dashboard/notifications"
          className="mt-2 shrink-0 rounded-lg px-1 py-2 text-center text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          See all notifications
        </Link>
      )}
    </section>
  );
}
