export interface RiotEventResponse {
  id: string;

  gameId: string;

  title: string;

  status: string;

  trackedUsers: number;

  checkedAt: string;
}

export interface RiotEventsResponse {
  events: RiotEventResponse[];
}

export interface RiotPlatformStatusResponse {
  id: string;

  maintenances: unknown[];
}

export interface RiotChampionRotationResponse {
  sr: number[];

  newplayer: number[];
}