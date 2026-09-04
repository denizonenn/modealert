"use client"

import { Mail } from "lucide-react"
import { SiDiscord } from "react-icons/si"

import { cn } from "@/lib/utils"
import { useI18n } from "@/components/providers/i18n-provider"

export interface Channels {
  emailEnabled: boolean
  discordEnabled: boolean
}

// Per-item override of the account-wide email/Discord switches — lets
// a user mute just this event/game without touching their global
// notification settings. Always renders both icons regardless of
// whether the account has a Discord webhook configured yet (an "off"
// preference set now still applies once they add one later).
export function ChannelToggle({
  channels,
  onChange,
  className,
}: {
  channels: Channels
  onChange: (channels: Partial<Channels>) => void
  className?: string
}) {
  const { dict } = useI18n()
  const t = dict.dashboardPage

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onChange({ emailEnabled: !channels.emailEnabled })
        }}
        aria-label={
          channels.emailEnabled ? t.emailNotificationsOn : t.emailNotificationsOff
        }
        aria-pressed={channels.emailEnabled}
        title={
          channels.emailEnabled ? t.emailNotificationsOn : t.emailNotificationsOff
        }
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
          channels.emailEnabled
            ? "border-white/10 bg-black/30 text-zinc-300 hover:border-white/20"
            : "border-white/5 bg-transparent text-zinc-700 hover:text-zinc-500"
        )}
      >
        <Mail className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onChange({ discordEnabled: !channels.discordEnabled })
        }}
        aria-label={
          channels.discordEnabled
            ? t.discordNotificationsOn
            : t.discordNotificationsOff
        }
        aria-pressed={channels.discordEnabled}
        title={
          channels.discordEnabled
            ? t.discordNotificationsOn
            : t.discordNotificationsOff
        }
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
          channels.discordEnabled
            ? "border-white/10 bg-black/30 text-zinc-300 hover:border-white/20"
            : "border-white/5 bg-transparent text-zinc-700 hover:text-zinc-500"
        )}
      >
        <SiDiscord className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
