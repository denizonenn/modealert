import type {
  EventProvider,
  ProviderEvent,
  ProviderEventStatus,
} from "../core/provider";

import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { renderEventDescription } from "@/lib/i18n/event-descriptions";

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
// this file's author can actually stand behind for as long as the
// entry sits here unattended, never a one-time snapshot.
// - "LIVE" — either structurally permanent (no live verification
//   needed), or computed fresh from a real, fixed, official formula
//   every time this runs (e.g. Destiny 2's Iron Banner — a deterministic
//   date formula from Bungie's announced schedule, recomputed on every
//   sync, see docs/06_DECISIONS.md ADR-034). Never a frozen "I checked
//   once and it was live" snapshot — nothing here re-checks these
//   entries automatically, so a snapshot claim would silently go stale
//   the moment reality changes (see ADR-036's Arena correction: it was
//   briefly shipped as a WebSearch-verified LIVE claim, then reverted
//   to ENDED for exactly this reason — a one-time verification isn't a
//   live signal, and there's no way for ModeAlert to notice if it stops
//   being true).
// - "ENDED" — known rotating mode, no self-updating signal (live API or
//   computed formula) confirming it's active right now, even if a
//   one-time manual check found it active recently. Never a fabricated
//   or frozen-snapshot LIVE claim, never an invented date.
//
// If a mode listed here ever gets its own real, dated
// communitydragon-sourced row (live or PBE), that row reports the
// real status; this provider's entry keeps re-asserting itself
// alongside it under a different id/source without conflicting.
interface KnownMode {
  id: string;
  gameId: string;
  title: string;
  descriptionKey: string;
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
    descriptionKey: "rotatingModes.lolNormal",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-sr-ranked-solo",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Ranked Solo/Duo",
    descriptionKey: "rotatingModes.lolRankedSolo",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-sr-ranked-flex",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Ranked Flex",
    descriptionKey: "rotatingModes.lolRankedFlex",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-sr-swiftplay",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Swiftplay",
    descriptionKey: "rotatingModes.lolSwiftplay",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-aram",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "ARAM",
    descriptionKey: "rotatingModes.lolAram",
    status: "LIVE",
    isLimitedTime: false,
  },
  // URF, Arena, ARAM Mayhem, and League Classic used to all be static
  // entries here (Mayhem/Classic as hardcoded permanent LIVE claims
  // never re-verified after the WebSearch that confirmed them, ADR-029;
  // URF/Arena as honest ENDED-by-default placeholders, ADR-024/ADR-036)
  // — all four replaced 2026-08-13 by real, live, self-updating rows
  // from lib/providers/lol-client-config/, which queries Riot's own
  // unauthenticated client config service (clientconfig.rpg.riotgames.com)
  // for genuine per-region "is this queue enabled right now" data.
  // Mayhem/Classic keep isLimitedTime: false there (that's a separate,
  // still-valid structural claim from the same WebSearch research —
  // only `status` needed to stop being frozen). See docs/06_DECISIONS.md
  // ADR-037/ADR-038.
  // "ARAM: Mayhem Classic-ish" used to be a static always-ENDED entry
  // here. Moved to lib/providers/communitydragon/normalizer.ts —
  // it's now derived from League Classic's real pass-window dates
  // instead of a hardcoded guess (see ADR-028). A static entry that
  // can never say LIVE was flatly wrong the moment that window opened.

  // Valorant and Fortnite core modes — same treatment as LoL's
  // Summoner's Rift/ARAM: structurally permanent, years-unchanged,
  // confirmed via WebSearch 2026-08-12, not something requiring live
  // verification. Both games previously had zero PLAYABLE-category
  // entries (only Platform Status/Item Shop/Acts), so the Playable
  // filter showed nothing meaningful for them until now.
  {
    id: "valorant-mode-competitive",
    gameId: GAME_IDS.VALORANT,
    title: "Competitive",
    descriptionKey: "rotatingModes.valorantCompetitive",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "valorant-mode-unrated",
    gameId: GAME_IDS.VALORANT,
    title: "Unrated",
    descriptionKey: "rotatingModes.valorantUnrated",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "fortnite-mode-battle-royale",
    gameId: GAME_IDS.FORTNITE,
    title: "Battle Royale",
    descriptionKey: "rotatingModes.fortniteBattleRoyale",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "fortnite-mode-zero-build",
    gameId: GAME_IDS.FORTNITE,
    title: "Zero Build",
    descriptionKey: "rotatingModes.fortniteZeroBuild",
    status: "LIVE",
    isLimitedTime: false,
  },

  // TFT core queues — sourced from the same real CommunityDragon
  // queues.json already used for LoL (queue ids 1090/1100/1130,
  // fetched 2026-08-12), not re-derived from a new source.
  {
    id: "tft-mode-normal",
    gameId: GAME_IDS.TFT,
    title: "Normal",
    descriptionKey: "rotatingModes.tftNormal",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "tft-mode-ranked",
    gameId: GAME_IDS.TFT,
    title: "Ranked",
    descriptionKey: "rotatingModes.tftRanked",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "tft-mode-hyper-roll",
    gameId: GAME_IDS.TFT,
    title: "Hyper Roll",
    descriptionKey: "rotatingModes.tftHyperRoll",
    status: "LIVE",
    isLimitedTime: false,
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

        description: renderEventDescription(
          mode.descriptionKey,
          {},
          "en"
        )!,
        descriptionKey: mode.descriptionKey,
        descriptionParams: {},

        status: mode.status,

        category: EVENT_CATEGORIES.PLAYABLE,

        isLimitedTime: mode.isLimitedTime,

        trackedUsers: 0,

        checkedAt: now,
      })
    );
  },
};
