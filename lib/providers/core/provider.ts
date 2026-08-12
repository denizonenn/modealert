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