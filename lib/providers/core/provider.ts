export type ProviderEventStatus =
  | "LIVE"
  | "UPCOMING"
  | "TRACKING"
  | "ENDED";

export interface ProviderEvent {
  id: string;

  gameId: string;

  title: string;

  status: ProviderEventStatus;

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