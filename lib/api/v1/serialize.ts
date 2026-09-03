import type { EventWithGame } from "@/lib/repositories/event.repository";

// Public API response shapes — deliberately narrower than the DB row.
// `source` (internal provider id) and `trackedUsers` (ModeAlert's own
// engagement metric) aren't useful to a third-party integration and
// aren't a promise we want to keep stable for external consumers.
export function serializeEvent(event: EventWithGame) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    slug: event.slug,
    status: event.status,
    category: event.category,
    isLimitedTime: event.isLimitedTime,
    lastChecked: event.lastChecked,
    game: {
      id: event.game.id,
      slug: event.game.slug,
      name: event.game.name,
      logo: event.game.logo,
      color: event.game.color,
    },
  };
}

export function serializeHistoryEntry(entry: {
  startedAt: Date;
  endedAt: Date | null;
  status: string;
}) {
  return {
    status: entry.status,
    startedAt: entry.startedAt,
    endedAt: entry.endedAt,
  };
}
