import { events } from "@/lib/data/events";
import { games } from "@/lib/data/games";
import EventStatusCard from "./event-status-card";

export default function WatchingList() {
  return (
    <div className="grid gap-6">
      {events.map((event) => {
        const game = games.find(
          (g) => g.id === event.game
        );

        return (
          <EventStatusCard
            key={event.id}
            game={game?.name ?? "Unknown"}
            event={event.title}
            status={event.status}
            updatedAt={event.lastChecked}
          />
        );
      })}
    </div>
  );
}