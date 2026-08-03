import { EventStatus } from "./status";
import { Game } from "./game";

export interface Event {
  id: string;

  gameId: string;

  game: Game;

  title: string;

  status: EventStatus;

  trackedUsers: number;

  lastChecked: string;
}