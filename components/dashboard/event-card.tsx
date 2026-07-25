import { Badge } from "@/components/ui/badge"

type Props = {
  game: string
  event: string
  status: "live" | "offline"
  tracking: number
}

export function EventCard({
  game,
  event,
  status,
  tracking,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            {game}
          </p>

          <h3 className="text-lg font-semibold">
            {event}
          </h3>
        </div>

        <Badge
          className={
            status === "live"
              ? "bg-green-500 text-black"
              : "bg-zinc-700"
          }
        >
          {status}
        </Badge>
      </div>

      <p className="mt-4 text-sm text-zinc-400">
        {tracking.toLocaleString()} users tracking
      </p>
    </div>
  )
}