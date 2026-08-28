import type { ProviderEvent, ProviderEventStatus } from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";

import type { PoeLeaguesResponse } from "./types";

// Each temporary challenge league ships as 8 variants (Hardcore/SSF/
// Ruthless combos of the same season). The one whose id matches its
// own category.id is the canonical softcore variant — the others are
// just modifiers on the same event, so only that one is surfaced.
export function mapCurrentLeague(
  leagues: PoeLeaguesResponse
): ProviderEvent[] {
  const current = leagues.find(
    (league) =>
      league.category?.current === true &&
      league.id === league.category.id
  );

  if (!current || !current.startAt) {
    return [];
  }

  const now = new Date();
  const startAt = new Date(current.startAt);
  const endAt = current.endAt ? new Date(current.endAt) : null;

  let status: ProviderEventStatus = "LIVE";

  if (now < startAt) {
    status = "UPCOMING";
  } else if (endAt && now > endAt) {
    status = "ENDED";
  }

  // Real third-party league blurbs (`current.description`) can't be
  // translated — only the fallback we author ourselves gets a
  // descriptionKey, same reasoning as Destiny's milestone/Helldivers'
  // briefing text. See docs/06_DECISIONS.md ADR-054 "Faz 3".
  const descriptionKey = current.description
    ? undefined
    : "poe.leagueFallback";
  const descriptionParams = descriptionKey
    ? { leagueId: current.id }
    : undefined;

  return [
    {
      id: "poe-current-league",
      gameId: GAME_IDS.PATH_OF_EXILE,
      title: `${current.id} League`,
      description:
        current.description ||
        renderEventDescription(
          "poe.leagueFallback",
          { leagueId: current.id },
          "en"
        )!,
      descriptionKey,
      descriptionParams,
      status,
      category: EVENT_CATEGORIES.PLAYABLE,
      isLimitedTime: true,
      trackedUsers: 0,
      checkedAt: now,
    },
  ];
}
