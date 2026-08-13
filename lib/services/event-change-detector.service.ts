import {
  getEventById,
} from "@/lib/repositories/event.repository";

import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

export interface FieldChange {
  field: string;

  oldValue: string | null;

  newValue: string | null;
}

// Fields worth a permanent changelog entry — a real edit trail
// ("this event's description changed on X date"), separate from
// EventHistory's LIVE/TRACKING occurrence spans (which only capture
// when an occurrence started/ended, not what else changed about it
// along the way). "status" is intentionally included here too: it
// gives an exact transition timestamp/old-new pair, which the
// occurrence-span model doesn't.
const TRACKED_FIELDS = [
  "title",
  "description",
  "status",
  "category",
  "isLimitedTime",
] as const;

interface ComparableEvent {
  title: string;
  description?: string | null;
  status: string;
  category: string;
  isLimitedTime: boolean;
}

function toComparable(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

export function diffEventFields(
  current: ComparableEvent,
  incoming: ComparableEvent
): FieldChange[] {
  const changes: FieldChange[] = [];

  for (const field of TRACKED_FIELDS) {
    const oldValue = toComparable(current[field]);
    const newValue = toComparable(incoming[field]);

    if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}

export const eventChangeDetectorService = {
  async detect(
    incoming: ProviderEvent
  ) {
    const current =
      await getEventById(
        incoming.id
      );

    if (!current) {
      return {
        changed: true,

        previous: null,

        fieldChanges: [] as FieldChange[],
      };
    }

    return {
      changed:
        current.status !==
        incoming.status,

      previous: current,

      fieldChanges: diffEventFields(
        current,
        incoming
      ),
    };
  },
};
