import type {
  ProviderEvent,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import {
  renderEventDescription,
  type EventDescriptionParams,
} from "@/lib/i18n/event-descriptions";

import type {
  FortniteShopData,
} from "./types";

const FEATURED_ITEM_COUNT = 5;

function describeShop(
  shop: FortniteShopData
): { key: string; params: EventDescriptionParams } {
  const allNames = shop.entries
    .flatMap((entry) => entry.brItems ?? [])
    .map((item) => item.name);

  // The raw API repeats the same item name across multiple entries
  // (different rarity/bundle variants of the same cosmetic) — verified
  // live 2026-08-19, e.g. "Frets of Chaos" appearing twice back to
  // back. Deduped for display so the summary doesn't read as a bug;
  // `shop.entries.length` (the real offer count in the title) is
  // untouched, this only affects the "Featuring: ..." sample list.
  const names = [...new Set(allNames)];

  const featured = names.slice(0, FEATURED_ITEM_COUNT).join(", ");

  const remaining = names.length - FEATURED_ITEM_COUNT;

  if (!featured) {
    return {
      key: "fortnite.shopOffersOnly",
      params: { count: shop.entries.length },
    };
  }

  return remaining > 0
    ? {
        key: "fortnite.shopFeaturedMore",
        params: { featured, remaining },
      }
    : { key: "fortnite.shopFeatured", params: { featured } };
}

export function mapItemShop(
  shop: FortniteShopData
): ProviderEvent[] {
  const { key: descriptionKey, params: descriptionParams } =
    describeShop(shop);

  return [
    {
      id: "fortnite-item-shop",

      gameId: GAME_IDS.FORTNITE,

      title: `Item Shop (${shop.entries.length} items)`,

      description: renderEventDescription(
        descriptionKey,
        descriptionParams,
        "en"
      )!,
      descriptionKey,
      descriptionParams,

      status: "LIVE",

      category: EVENT_CATEGORIES.COSMETIC_SHOP,

      isLimitedTime: true,

      trackedUsers: 0,

      checkedAt: new Date(),
    },
  ];
}
