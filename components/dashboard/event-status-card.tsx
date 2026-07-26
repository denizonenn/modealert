import StatusBadge from "@/components/shared/status-badge";
import { EventStatus } from "@/types/status";

interface Props {
  game: string;
  event: string;
  status: EventStatus;
  updatedAt: string;
}

export default function EventStatusCard({
  game,
  event,
  status,
  updatedAt,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {game}
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            {event}
          </h3>
        </div>

        <StatusBadge status={status} />
      </div>

      <p className="mt-6 text-sm text-zinc-400">
        Last checked {updatedAt}
      </p>
    </div>
  );
}