export interface PubgSeason {
  id: string;
  attributes: {
    isCurrentSeason: boolean;
    isOffseason: boolean;
  };
}

export interface PubgSeasonsResponse {
  data: PubgSeason[];
}
