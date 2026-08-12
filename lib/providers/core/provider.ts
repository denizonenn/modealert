import type { EventCategory } from "@/lib/constants/event-category";

export type ProviderEventStatus =
  | "LIVE"
  | "UPCOMING"
  | "TRACKING"
  | "ENDED";

export interface ProviderEvent {
  id: string;

  gameId: string;

  title: string;

  description?: string;

  status: ProviderEventStatus;

  category: EventCategory;

  // Whether this is a structurally permanent mode/feature (Summoner's
  // Rift's core queues, platform status) vs something genuinely
  // time-boxed (a battle pass window, a rotating featured mode, a
  // daily/weekly reset). Independent of `status` — a limited-time
  // thing can be LIVE right now and a permanent thing is always LIVE.
  isLimitedTime: boolean;

  // Groups multiple Event rows that are really successive occurrences
  // of the same recurring thing under one real, provider-derived key
  // (e.g. every "Mayhem Set N" pass window shares one seriesKey) so
  // stats/predictions can look at the full recurring history instead
  // of just this one occurrence's row. Omitted for events that aren't
  // part of a recognized recurring series — most events.
  seriesKey?: string;

  trackedUsers: number;

  checkedAt: Date;
}

export interface EventProvider {
  /*
  |--------------------------------------------------------------------------
  | Metadata
  |--------------------------------------------------------------------------
  */

  readonly id: string;

  readonly name: string;

  readonly enabled: boolean;

  /*
  |--------------------------------------------------------------------------
  | Events
  |--------------------------------------------------------------------------
  */

  getEvents(): Promise<ProviderEvent[]>;
}