import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type EventStatus = "LIVE" | "UPCOMING" | "TRACKING" | "ENDED"

const STATUS_STYLES: Record<EventStatus, string> = {
  LIVE: "border-emerald-400/30 bg-emerald-500/15 text-emerald-400",
  UPCOMING: "border-amber-400/30 bg-amber-500/15 text-amber-400",
  TRACKING: "border-blue-400/30 bg-blue-500/15 text-blue-400",
  ENDED: "border-white/10 bg-white/5 text-zinc-500",
}

interface EventStatusBadgeProps {
  status: EventStatus
  className?: string
}

export function EventStatusBadge({
  status,
  className,
}: EventStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {status === "LIVE" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
      )}
      {status}
    </Badge>
  )
}
