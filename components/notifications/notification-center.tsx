"use client";

import NotificationItem from "./notification-item";
import EmptyState from "./empty-state";

import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Loading notifications...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Notifications
        </h2>

        <span className="rounded-full bg-blue-600 px-3 py-1 text-sm">
          {unreadCount} unread
        </span>
      </div>

      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              message={notification.message}
              read={notification.read}
              createdAt={notification.createdAt}
            />
          ))}
        </div>
      )}
    </section>
  );
}