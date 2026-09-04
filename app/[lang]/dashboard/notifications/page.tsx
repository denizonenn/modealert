"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/shared/skeleton"

import NotificationItem from "@/components/notifications/notification-item"
import EmptyState from "@/components/notifications/empty-state"

import { useNotifications } from "@/hooks/use-notifications"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useI18n } from "@/components/providers/i18n-provider"

type Filter = "all" | "unread"

export default function NotificationHistoryPage() {
  const { dict, path } = useI18n()
  const authStatus = useRequireAuth()

  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    reportFalsePositive,
  } = useNotifications()

  const [filter, setFilter] = useState<Filter>("all")

  const visible =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications

  if (authStatus !== "authenticated") {
    return (
      <>
        <Navbar />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main id="main-content" className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <Link
          href={path("/dashboard")}
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.notifications.backToDashboard}
        </Link>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {dict.notifications.historyTitle}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {dict.notifications.historyIntro}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => markAllRead()}
            >
              {dict.notifications.markAllRead}
            </Button>
          )}
        </div>

        <div className="mt-8 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className={
              filter === "all"
                ? "bg-white text-black hover:bg-zinc-200"
                : "text-zinc-400 hover:bg-white/10 hover:text-white"
            }
            onClick={() => setFilter("all")}
          >
            {dict.notifications.filterAll.replace(
              "{count}",
              String(notifications.length)
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className={
              filter === "unread"
                ? "bg-white text-black hover:bg-zinc-200"
                : "text-zinc-400 hover:bg-white/10 hover:text-white"
            }
            onClick={() => setFilter("unread")}
          >
            {dict.notifications.filterUnread.replace(
              "{count}",
              String(unreadCount)
            )}
          </Button>
        </div>

        <div className="mt-6 space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : visible.length === 0 ? (
            <EmptyState />
          ) : (
            visible.map((notification) => (
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
      </main>

      <Footer />
    </>
  )
}
