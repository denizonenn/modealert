"use client";

import EventStatusCard from "./event-status-card";

import { useEvents } from "@/hooks/use-events";
import type { EventStatus } from "@/types/status";

export default function WatchingList() {
  const { events, isLoading } = useEvents();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-6">
      {events.map((event) => (
        <EventStatusCard
          key={event.id}
          game={event.game.name}
          event={event.title}
          status={event.status as EventStatus}
          updatedAt={event.lastChecked.toString()}
        />
      ))}
    </div>
  );
}