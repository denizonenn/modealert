"use client";

import { useEffect, useState } from "react";

import { Event } from "@/types/event";

import { eventService } from "@/lib/services/event.service";

import { useOnboardingStore } from "@/stores/onboarding-store";

import EventCard from "../cards/event-card";

export default function EventSelector() {
  const { selectedGames } = useOnboardingStore();

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function load() {
      const allEvents =
        await eventService.getAllEvents();

      setEvents(
        allEvents.filter((event) =>
          selectedGames.includes(event.game)
        )
      );
    }

    load();
  }, [selectedGames]);

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2">
      {events.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          name={event.title}
          description={event.game}
          selected={false}
          onClick={() => {}}
        />
      ))}
    </div>
  );
}