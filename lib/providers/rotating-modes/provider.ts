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
// - "LIVE" — either structurally permanent (no live verification
//   needed), or a rotating mode with a real, dated, official source
//   confirming it's active right now (e.g. Riot's own patch notes —
//   see Arena below). Always cites the source and verification date
//   so staleness is visible, same as Destiny 2's Iron Banner
//   (computed from Bungie's announced schedule rather than a live API
//   signal, see docs/06_DECISIONS.md ADR-034).
// - "ENDED" — known rotating mode, zero signal (live API or dated
//   official source) confirming it's active right now. Never a
//   fabricated LIVE claim, never an invented date.
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
    id: "lol-mode-aram-mayhem",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "ARAM: Mayhem",
    description:
      "ARAM with chaotic augments and Set-based progression. Started as a limited-time test but Riot confirmed in a March 2026 dev update that it's staying with no end date in mind (verified via WebSearch 2026-08-12) — no longer inferred from its battle-pass window, it's a confirmed-permanent core mode now.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "lol-mode-league-classic",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "League Classic",
    description:
      "The old-school alternate client, recreating early-League gameplay (Season 3-inspired) inside the current launcher — no separate install. Launched July 29, 2026 designed as a permanent mode, sitting alongside Arena/URF in the mode picker (verified via WebSearch 2026-08-12). Recent enough that long-term permanence isn't as proven as Summoner's Rift/ARAM's decade-plus track record, but it wasn't launched as a time-limited test the way Arena/original Mayhem were.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "rotating-mode-urf",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "URF",
    description:
      "Ultra Rapid Fire — near-zero cooldowns, no mana, chaos. A rotating featured mode; Riot doesn't publish a schedule for when featured modes are in rotation, so ModeAlert has no live signal for it right now (checked both the live and PBE event-hub feeds directly — neither has a URF entry). Its last confirmed run (as ARURF) started January 22, 2026 with Patch 26.2, per Riot's own official patch notes (verified via WebSearch 2026-08-12) — no reliable end date found, so that's not seeded as history here (would be false precision). Tracked so you don't miss the next one — the moment Riot's data shows a real URF window, ModeAlert reports its actual status and starts building real history (how long it stays live, PBE-to-live lag) automatically.",
    status: "ENDED",
    isLimitedTime: true,
  },
  {
    id: "rotating-mode-arena",
    gameId: GAME_IDS.LEAGUE_OF_LEGENDS,
    title: "Arena",
    description:
      "2v2v2v2v2v2v2v2 round-based combat with augments. Same no-API-signal problem as URF (checked both the live and PBE event-hub feeds directly — neither has an Arena entry), so this isn't from ModeAlert's usual live pipeline. Unlike URF though, there's real, current, official evidence it's active right now: Riot's own Patch 26.16 notes (published August 12, 2026, leagueoflegends.com) confirm ongoing Arena content — champion balance changes plus the weekly 'Bravery Arena' variant returning — for its run that's been going since June 25, 2025 (Patch 25.13). Marked LIVE from that dated official source, not a live API signal (verified via WebSearch 2026-08-13) — re-verify if this starts to look stale, since Arena still rotates and isn't confirmed permanent the way ARAM Mayhem/League Classic are.",
    status: "LIVE",
    isLimitedTime: true,
  },
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
    description:
      "5v5 ranked ladder, best-of-25 (first to 13), Iron through Radiant. One of Valorant's original permanent modes since launch.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "valorant-mode-unrated",
    gameId: GAME_IDS.VALORANT,
    title: "Unrated",
    description:
      "Same rules as Competitive, no rank on the line. Permanent core mode since launch.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "fortnite-mode-battle-royale",
    gameId: GAME_IDS.FORTNITE,
    title: "Battle Royale",
    description:
      "Fortnite's original permanent mode — 100 players, last one standing. Building enabled.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "fortnite-mode-zero-build",
    gameId: GAME_IDS.FORTNITE,
    title: "Zero Build",
    description:
      "Battle Royale with building disabled. Permanent playlist since its 2022 launch, still actively updated (confirmed via WebSearch 2026-08-12).",
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
    description:
      "Standard Teamfight Tactics queue, no rank on the line. Permanent core queue.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "tft-mode-ranked",
    gameId: GAME_IDS.TFT,
    title: "Ranked",
    description:
      "TFT's ranked ladder. Permanent core queue.",
    status: "LIVE",
    isLimitedTime: false,
  },
  {
    id: "tft-mode-hyper-roll",
    gameId: GAME_IDS.TFT,
    title: "Hyper Roll",
    description:
      "Faster-paced TFT — more gold, faster rerolls, single-elimination-style. Permanent core queue.",
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
