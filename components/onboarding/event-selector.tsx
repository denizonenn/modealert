"use client";

import { useMemo } from "react";

import { useOnboardingStore } from "@/stores/onboarding-store";

import { useEvents } from "@/hooks/use-events";
import { Skeleton } from "@/components/shared/skeleton";

import EventCard from "../cards/event-card";

export default function EventSelector() {
  const {
    selectedGames,
    selectedEvents,
    toggleEvent,
  } = useOnboardingStore();

  const {
    events,
    isLoading,
    error,
  } = useEvents();

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        selectedGames.includes(event.gameId)
      ),
    [events, selectedGames]
  );

  if (isLoading) {
    return (
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-10 text-center text-zinc-500">
        Failed to load events.
      </p>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <p className="mt-10 text-center text-zinc-500">
        No events found for your selected games yet — check back soon.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2">
      {filteredEvents.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          name={event.title}
          description={event.game.name}
          selected={selectedEvents.includes(event.id)}
          onClick={() => toggleEvent(event.id)}
        />
      ))}
    </div>
  );
}
