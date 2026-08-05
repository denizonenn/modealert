import type {
  ProviderEvent,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";

import type {
  FortniteShopData,
} from "./types";

export function mapItemShop(
  shop: FortniteShopData
): ProviderEvent[] {
  return [
    {
      id: "fortnite-item-shop",

      gameId: GAME_IDS.FORTNITE,

      title: `Item Shop (${shop.entries.length} items)`,

      status: "LIVE",

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}
