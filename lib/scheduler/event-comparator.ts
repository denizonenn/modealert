import type { ProviderEvent } from "@/lib/providers/core/provider";
import type { EventWithGame } from "@/lib/repositories/event.repository";

export interface ComparisonResult {
  newEvents: ProviderEvent[];
  updatedEvents: ProviderEvent[];
}

export function compareEvents(
  providerEvents: ProviderEvent[],
  databaseEvents: EventWithGame[]
): ComparisonResult {
  const databaseMap = new Map(
    databaseEvents.map((event) => [event.id, event])
  );

  const newEvents: ProviderEvent[] = [];
  const updatedEvents: ProviderEvent[] = [];

  for (const providerEvent of providerEvents) {
    const databaseEvent = databaseMap.get(providerEvent.id);

    if (!databaseEvent) {
      newEvents.push(providerEvent);
      continue;
    }

    if (databaseEvent.status !== providerEvent.status) {
      updatedEvents.push(providerEvent);
    }
  }

  return {
    newEvents,
    updatedEvents,
  };
}