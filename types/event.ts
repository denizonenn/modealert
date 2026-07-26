export type EventStatus =
  | "LIVE"
  | "UPCOMING"
  | "TRACKING"
  | "ENDED";

export interface Event {
  id: string;

  game: string;

  title: string;

  status: EventStatus;

  trackedUsers: number;

  lastChecked: string;
}