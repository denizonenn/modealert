export interface RiotPlatformStatusResponse {
  id: string;

  maintenances: unknown[];
}

export interface RiotChampionRotationResponse {
  sr: number[];

  newplayer: number[];
}