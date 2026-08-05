"use client"

import { Bell } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import NotificationCenter from "@/components/notifications/notification-center"

import { useNotifications } from "@/hooks/use-notifications"

export function NotificationBell() {
  const { unreadCount } = useNotifications()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/10"
          />
        }
      >
        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-brand px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 border border-white/10 bg-black p-3 text-white shadow-2xl"
      >
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  )
}
