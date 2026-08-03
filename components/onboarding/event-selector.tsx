"use client";

import { useMemo } from "react";

import { useOnboardingStore } from "@/stores/onboarding-store";

import { useEvents } from "@/hooks/use-events";

import EventCard from "../cards/event-card";

export default function EventSelector() {
  const { selectedGames } =
    useOnboardingStore();

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
      <div className="mt-10">
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10">
        Failed to load events.
      </div>
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
          selected={false}
          onClick={() => {}}
        />
      ))}
    </div>
  );
}