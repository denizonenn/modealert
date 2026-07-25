import { Badge } from "@/components/ui/badge";

interface Props {
  title: string;
  game: string;
  status: string;
  trackedUsers: number;
  lastChecked: string;
}

export function EventCard({
  title,
  game,
  status,
  trackedUsers,
  lastChecked,
}: Props) {
  const badgeClass =
    status === "LIVE"
      ? "bg-green-500 text-black"
      : status === "UPCOMING"
      ? "bg-yellow-500 text-black"
      : status === "TRACKING"
      ? "bg-blue-500"
      : "bg-zinc-600";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">{game}</p>

          <h3 className="mt-1 text-xl font-semibold">
            {title}
          </h3>
        </div>

        <Badge className={badgeClass}>
          {status}
        </Badge>
      </div>

      <div className="mt-6 space-y-2 text-sm text-zinc-400">
        <div>
          👥 {trackedUsers.toLocaleString()} tracking
        </div>

        <div>
          ⏱ {lastChecked}
        </div>
      </div>
    </div>
  );
}