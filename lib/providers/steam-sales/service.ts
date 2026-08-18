import { steamSalesClient } from "./client";
import { STEAM_TRACKED_GAMES } from "./constants";
import { mapSteamSale } from "./event-mapper";

import type { ProviderEvent } from "../core/provider";

export const steamSalesService = {
  async getEvents(): Promise<ProviderEvent[]> {
    const results = await Promise.all(
      STEAM_TRACKED_GAMES.map(async ({ gameId, gameName, appId }) => {
        const response = await steamSalesClient.getPriceOverview(appId);
        return mapSteamSale(gameId, gameName, appId, response);
      })
    );

    return results.flat();
  },
};
