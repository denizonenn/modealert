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