import { fortniteClient } from "./client";

import {
  FORTNITE_SHOP_ENDPOINT,
} from "./constants";

import { mapItemShop } from "./event-mapper";

import type {
  FortniteShopResponse,
} from "./types";

export const fortniteService = {
  async getEvents() {
    const shop =
      await fortniteClient.get<FortniteShopResponse>(
        FORTNITE_SHOP_ENDPOINT
      );

    return mapItemShop(shop.data);
  },
};
