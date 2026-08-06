import { foxholeClient } from "./client";

import { FOXHOLE_WAR_ENDPOINT } from "./constants";

import { mapCurrentWar } from "./event-mapper";

import type { FoxholeWarState } from "./types";

export const foxholeService = {
  async getEvents() {
    const war = await foxholeClient.get<FoxholeWarState>(
      FOXHOLE_WAR_ENDPOINT
    );

    return mapCurrentWar(war);
  },
};
