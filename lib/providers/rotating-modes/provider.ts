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
// schedule (see docs/06_DECISIONS.md ADR-017/ADR-020/ADR-023/
// ADR-024/ADR-025/ADR-026).
//
// Names and queue groupings below are sourced from CommunityDragon's
// real, public, keyless queues.json (verified 2026-08-12) — not
// invented. That file lists 420 queue ids spanning League's entire
// history, most long dead, with no "currently active" field (the same
// conclusion ADR-017 reached). What IS usable from it: which of the
// CURRENT queue ids are the kind of queue Riot itself doesn't classify
// as limited-time (`isLimitedTimeQueue: false`) — a stable structural
// fact, not a live one. That signal isn't perfect on its own (ARAM
// Mayhem is also flagged `false` despite genuinely rotating — its
// actual availability is tracked separately via the real, dated
// event-hub pass-window entries, e.g. "Mayhem Set 2"), so only queues
// this file's author can independently verify have been continuously
// queueable for years (Summoner's Rift's core queues, ARAM) get
// `status: "LIVE"` here.
//
// The one rule that must never be broken: `status` reflects a fact
// this file's author can actually stand behind, never a guess.
// - "LIVE" — structurally permanent, no live verification needed.
// - "ENDED" — known rotating mode, zero live signal right now. Never
//   a fabricated LIVE claim, never an invented date.
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
  // Structurally permanent (a core queue) vs a rotating/featured mode
  // — independent of `status`. See ADR-026.
  isLimitedTime: boolean;
}

const KNOWN_MODES: KnownMode[] = [
  {
    id: "lol-mode-sr-normal",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Normal (Draft Pick)",
    description:
      "Summoner's Rift, 5v5, draft pick against the enemy team. One of League's core queues — permanently available, not something that starts or ends.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-sr-ranked-solo",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Ranked Solo/Duo",
    description:
      "Summoner's Rift, 5v5, the main ranked ladder (solo or duo queue). Permanently available core queue.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-sr-ranked-flex",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Ranked Flex",
    description:
      "Summoner's Rift, 5v5, ranked for premade groups of 2-5. Permanently available core queue.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-sr-swiftplay",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Swiftplay",
    description:
      "Summoner's Rift, a faster-paced normal queue with a shortened draft. Permanently available core queue.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-aram",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "ARAM",
    description:
      "Howling Abyss — random champions, one lane, no recalls to base shop between waves. Permanent, always-queueable core mode.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "rotating-mode-urf",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "URF",
    description:
      "Ultra Rapid Fire — near-zero cooldowns, no mana, chaos. A rotating featured mode; Riot doesn't publish a schedule for when featured modes are in rotation, so ModeAlert has no live signal for it right now (checked both the live and PBE event-hub feeds directly — neither has a URF entry). Tracked here so you don't miss it — the moment Riot's data shows a real URF window, ModeAlert reports its actual status and starts building real history (how long it stays live, PBE-to-live lag) automatically.",
    status: "ENDED",
    isLimitedTime: true,
  },
  {
    id: "lol-mode-aram-mayhem-classic",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "ARAM: Mayhem Classic-ish",
    description:
      "A rotating ARAM Mayhem variant themed around Classic mode. Riot's own queue data flags this one specifically as a limited-time queue type (unlike base ARAM or ARAM Mayhem) — no live signal for whether it's currently unlocked.",
    status: "ENDED",
    isLimitedTime: true,
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

        isLimitedTime: mode.isLimitedTime,

        trackedUsers: 0,

        checkedAt: now,
      })
    );
  },
};
