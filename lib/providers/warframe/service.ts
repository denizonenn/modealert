import { warframeClient } from "./client";

import { WARFRAME_WORLDSTATE_ENDPOINT } from "./constants";

import { mapWarframeEvents } from "./event-mapper";

import type { WarframeWorldstate } from "./types";

export const warframeService = {
  async getEvents() {
    const worldstate = await warframeClient.get<WarframeWorldstate>(
      WARFRAME_WORLDSTATE_ENDPOINT
    );

    return mapWarframeEvents(worldstate);
  },
};
