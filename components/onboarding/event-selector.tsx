"use client";

import { useMemo, useState } from "react";

import { useOnboardingStore } from "@/stores/onboarding-store";

import { useEvents } from "@/hooks/use-events";
import { Skeleton } from "@/components/shared/skeleton";
import { CategoryFilterBar } from "@/components/shared/category-filter-bar";

import {
  categorySortKey,
  EVENT_CATEGORIES,
  type EventCategory,
} from "@/lib/constants/event-category";

import EventCard from "../cards/event-card";

const STATUS_PRIORITY: Record<string, number> = {
  LIVE: 0,
  UPCOMING: 1,
  TRACKING: 2,
  ENDED: 3,
};

// Default to just the "real played thing" category — everything else
// (season passes, platform status, rotation milestones, shop
// rotations) is opt-in via the filter bar, not opt-out. Fixes the
// "list full of dummy events nobody plays" complaint at the source.
const DEFAULT_CATEGORIES: Set<EventCategory> = new Set([
  EVENT_CATEGORIES.PLAYABLE,
]);

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

  const [selectedCategories, setSelectedCategories] = useState<
    Set<EventCategory>
  >(DEFAULT_CATEGORIES);

  function toggleCategory(category: EventCategory) {
    setSelectedCategories((current) => {
      const next = new Set(current);

      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }

      // Never allow an empty filter — that would just show "no events"
      // with no obvious way back for the user.
      return next.size === 0 ? new Set([EVENT_CATEGORIES.PLAYABLE]) : next;
    });
  }

  const filteredEvents = useMemo(
    () =>
      events
        .filter(
          (event) =>
            selectedGames.includes(event.gameId) &&
            selectedCategories.has(event.category as EventCategory)
        )
        .sort(
          (a, b) =>
            categorySortKey(a.category, STATUS_PRIORITY[a.status] ?? 9) -
            categorySortKey(b.category, STATUS_PRIORITY[b.status] ?? 9)
        ),
    [events, selectedGames, selectedCategories]
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

  return (
    <div>
      <div className="mt-8">
        <CategoryFilterBar
          selected={selectedCategories}
          onToggle={toggleCategory}
        />
      </div>

      {filteredEvents.length === 0 ? (
        <p className="mt-10 text-center text-zinc-500">
          No events found for your selected games and categories yet —
          check back soon.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              name={event.title}
              gameName={event.game.name}
              description={event.description}
              category={event.category as EventCategory}
              selected={selectedEvents.includes(event.id)}
              onClick={() => toggleEvent(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
