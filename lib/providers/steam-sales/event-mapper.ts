import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

import type { SteamAppDetailsResponse } from "./types";

// Real, thin signal: Valve's own discount_percent for this app right
// now. No sale name/campaign data is available from this endpoint (a
// campaign name would need the separate, global featuredcategories
// endpoint, which doesn't say *which* apps are in it) — description
// stays honest about that rather than inventing a sale name.
export function mapSteamSale(
  gameId: string,
  gameName: string,
  appId: number,
  response: SteamAppDetailsResponse
): ProviderEvent[] {
  const now = new Date();
  const entry = response[String(appId)];
  const priceOverview = entry?.data?.price_overview;

  // F2P games and any lookup failure come back with no price_overview
  // at all — nothing real to report, so no event (not a fabricated
  // "always ENDED" placeholder).
  if (!priceOverview) {
    return [];
  }

  const status: ProviderEventStatus =
    priceOverview.discount_percent > 0 ? "LIVE" : "ENDED";

  const description =
    status === "LIVE"
      ? `${priceOverview.discount_percent}% off on Steam right now (${priceOverview.final / 100} ${priceOverview.currency}).`
      : `Not currently discounted on Steam (${priceOverview.initial / 100} ${priceOverview.currency}).`;

  return [
    {
      id: `steam-sale-${appId}`,
      gameId,
      title: `${gameName} — Steam Sale`,
      description,
      status,
      category: EVENT_CATEGORIES.COSMETIC_SHOP,
      isLimitedTime: true,
      seriesKey: `steam-sale-${appId}`,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}
