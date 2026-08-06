import { poeClient } from "./client";

import { POE_LEAGUES_ENDPOINT } from "./constants";

import { mapCurrentLeague } from "./event-mapper";

import type { PoeLeaguesResponse } from "./types";

export const poeService = {
  async getEvents() {
    const leagues = await poeClient.get<PoeLeaguesResponse>(
      POE_LEAGUES_ENDPOINT
    );

    return mapCurrentLeague(leagues);
  },
};
