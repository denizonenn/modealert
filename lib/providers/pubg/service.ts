import { pubgClient } from "./client";
import { mapCurrentSeason } from "./event-mapper";

export const pubgService = {
  async getEvents() {
    const seasons = await pubgClient.getSeasons();

    return mapCurrentSeason(seasons);
  },
};
