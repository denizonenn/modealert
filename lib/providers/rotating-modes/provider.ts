import type {
  EventProvider,
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";

// Static, hand-curated facts about known game modes that no public API
// exposes an "is it currently queueable" signal for — either because
// they're permanent fixtures (no API needed to know they're always
// on) or because they're rotating and Riot simply doesn't publish a
// schedule (see docs/06_DECISIONS.md ADR-017/ADR-020/ADR-023/ADR-024).
//
// The one rule that must never be broken here: `status` reflects a
// fact this file's author can actually stand behind, never a guess.
// - "LIVE" is only used for modes that are structurally permanent —
//   have been continuously queueable for years, not something that
//   needs live verification (same class of static fact as e.g. this
//   codebase's hand-written eventHubType description lookup).
// - "ENDED" is used for known rotating modes with zero live signal —
//   an honest "not currently confirmed active", never a fabricated
//   LIVE claim or an invented date.
//
// If a mode listed here ever gets its own real, dated
// communitydragon-sourced row (live or PBE), that row reports the
// real status; this provider's entry keeps re-asserting itself
// alongside it under a different id/source without conflicting.
interface KnownMode {
  id: string;
  gameId: string;
  title: string;
  description: string;
  status: ProviderEventStatus;
}

const KNOWN_MODES: KnownMode[] = [
  {
    id: "lol-mode-summoners-rift",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Summoner's Rift",
    description:
      "The 5v5 map — League's core mode (Normal + Ranked). Permanently queueable, not something that starts or ends, so ModeAlert has nothing to detect here — this entry just exists so it shows up in your playable-modes list.",
    status: "LIVE",
  },
  {
    id: "lol-mode-aram",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "ARAM",
    description:
      "Howling Abyss — random champions, one lane, no recalls to base shop between waves. A permanent, always-queueable mode, same as Summoner's Rift.",
    status: "LIVE",
  },
  {
    id: "rotating-mode-urf",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "URF",
    description:
      "Ultra Rapid Fire — near-zero cooldowns, no mana, chaos. A rotating featured mode; Riot doesn't publish a schedule for when featured modes are in rotation, so ModeAlert has no live signal for it right now (checked both the live and PBE event-hub feeds directly — neither has a URF entry). Tracked here so you don't miss it — the moment Riot's data shows a real URF window, ModeAlert reports its actual status and starts building real history (how long it stays live, PBE-to-live lag) automatically.",
    status: "ENDED",
  },
];

export const rotatingModesProvider: EventProvider = {
  id: "rotating-modes",

  name: "Known Modes",

  enabled: true,

  async getEvents(): Promise<
    ProviderEvent[]
  > {
    const now = new Date();

    return KNOWN_MODES.map(
      (mode) => ({
        id: mode.id,

        gameId: mode.gameId,

        title: mode.title,

        description: mode.description,

        status: mode.status,

        category: EVENT_CATEGORIES.PLAYABLE,

        trackedUsers: 0,

        checkedAt: now,
      })
    );
  },
};
