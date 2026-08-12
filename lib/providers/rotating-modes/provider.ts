import type {
  EventProvider,
  ProviderEvent,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

// Rotating featured modes (URF, first and foremost) that Riot doesn't
// publish a live/PBE schedule for — see docs/06_DECISIONS.md
// ADR-017/ADR-020/ADR-023/ADR-024. Verified 2026-08-12: no entry for
// any of these exists on either the live or PBE event-hub feed right
// now, and third-party patch-note coverage confirms the currently
// rotating featured modes are ARAM Mayhem/Arena/League Classic, not
// URF.
//
// These rows exist purely so the mode is visible and trackable in the
// UI while inactive — status is always ENDED (never a fabricated LIVE
// claim, never an invented date) and the description says plainly
// that there's no live signal right now. If Riot's CommunityDragon
// feed (live or PBE) ever reports one of these by name, the real
// communitydragon-sourced row takes over reporting its actual status;
// this provider keeps re-asserting its own honest placeholder
// alongside it under a different id/source, so nothing conflicts.
const KNOWN_INACTIVE_MODES: Array<{
  id: string;
  gameId: string;
  title: string;
  description: string;
}> = [
  {
    id: "rotating-mode-urf",

    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,

    title: "URF",

    description:
      "Ultra Rapid Fire — near-zero cooldowns, no mana, chaos. A rotating featured mode; Riot doesn't publish a schedule for when featured modes are in rotation, so ModeAlert has no live signal for it right now. Tracked here so you don't miss it — the moment Riot's data (live or PBE) shows a real URF window, ModeAlert reports its actual status and starts building real history (how long it stays live, PBE-to-live lag) automatically.",
  },
];

export const rotatingModesProvider: EventProvider = {
  id: "rotating-modes",

  name: "Known Rotating Modes",

  enabled: true,

  async getEvents(): Promise<
    ProviderEvent[]
  > {
    const now = new Date();

    return KNOWN_INACTIVE_MODES.map(
      (mode) => ({
        id: mode.id,

        gameId: mode.gameId,

        title: mode.title,

        description: mode.description,

        status: "ENDED",

        category: EVENT_CATEGORIES.PLAYABLE,

        trackedUsers: 0,

        checkedAt: now,
      })
    );
  },
};
