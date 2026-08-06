export interface PoeLeagueCategory {
  id: string;

  current?: boolean;
}

export interface PoeLeague {
  id: string;

  realm: string;

  startAt: string | null;

  endAt: string | null;

  description?: string;

  category?: PoeLeagueCategory;
}

export type PoeLeaguesResponse = PoeLeague[];
