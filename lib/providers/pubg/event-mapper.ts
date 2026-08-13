import type { ProviderEvent } from "../core/provider";
import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import type { PubgSeasonsResponse } from "./types";

// Season ids look like "division.bro.official.pc-2018-42" — the
// trailing number is the season number PUBG itself displays in-game
// and on its own site. No separate flavor name exists (unlike TFT
// sets), so "Season N" from that number is the honest, real label.
function seasonTitle(seasonId: string): string {
  const match = seasonId.match(/-(\d+)$/);

  return match ? `Season ${match[1]}` : seasonId;
}

export function mapCurrentSeason(
  response: PubgSeasonsResponse
): ProviderEvent[] {
  const current = response.data.find(
    (season) => season.attributes.isCurrentSeason
  );

  if (!current) {
    return [];
  }

  return [
    {
      id: `pubg-season-${current.id}`,
      gameId: GAME_IDS.PUBG,
      title: seasonTitle(current.id),
      description: `The current live PUBG ranked season, detected from PUBG's own live season data (\`isCurrentSeason\`) — not an announcement-date guess.`,
      status: "LIVE",
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      seriesKey: "pubg-season",
      trackedUsers: 0,
      checkedAt: new Date(),
    },
  ];
}
