// Some providers give successive real occurrences of the same
// recurring thing a fresh event id each time (e.g. CommunityDragon's
// yearly ranked season pass — see Event.seriesKey, ADR-031). Most of
// the time each occurrence also gets a distinct title ("Season 1: Act
// I" vs "Season 2: Act I") — that's real, useful history and every
// occurrence should stay visible. But sometimes two occurrences land
// on the exact same title (verified against real synced data,
// 2026-08-13: "Season 3: Act I" has one ENDED row from 2025 and one
// LIVE row from 2026, both titled identically) — that reads as a bug
// in a browse-to-pick list, not as history (see docs/06_DECISIONS.md
// ADR-027 "known limit" and docs/09_BACKLOG.md's "known duplicate-
// title issue"). Full history pages (/events/[slug], /games/[slug])
// still show every occurrence regardless of title collisions — this
// only applies to browse-to-pick lists (dashboard "All Events",
// onboarding).
//
// Deliberately keyed on (gameId, title) rather than seriesKey alone:
// collapsing by seriesKey would also merge same-series-different-title
// rows like "Season 1: Act I"/"Season 1: Act II", hiding real distinct
// occurrences that just happen to share a recurring pass family.
interface SeriesCollapsible {
  id: string;
  gameId: string;
  title: string;
  seriesKey: string | null;
  status: string;
  lastChecked: string;
}

const STATUS_PRIORITY: Record<string, number> = {
  LIVE: 0,
  UPCOMING: 1,
  TRACKING: 2,
  ENDED: 3,
};

function isMoreRelevant(
  candidate: SeriesCollapsible,
  current: SeriesCollapsible
): boolean {
  const candidatePriority =
    STATUS_PRIORITY[candidate.status] ?? 9;
  const currentPriority =
    STATUS_PRIORITY[current.status] ?? 9;

  if (candidatePriority !== currentPriority) {
    return candidatePriority < currentPriority;
  }

  return (
    new Date(candidate.lastChecked).getTime() >
    new Date(current.lastChecked).getTime()
  );
}

// Keeps every event without a seriesKey untouched, and every
// seriesKey'd event whose title is unique within its series untouched.
// Only when two events share BOTH a seriesKey AND an exact title does
// this keep just the single most relevant one (LIVE > UPCOMING >
// TRACKING > ENDED, most recently checked breaks ties). Preserves
// input order.
export function collapseSeriesToLatest<T extends SeriesCollapsible>(
  events: T[]
): T[] {
  const winnerByKey = new Map<string, T>();

  for (const event of events) {
    if (!event.seriesKey) {
      continue;
    }

    const key = `${event.gameId}::${event.seriesKey}::${event.title}`;
    const current = winnerByKey.get(key);

    if (!current || isMoreRelevant(event, current)) {
      winnerByKey.set(key, event);
    }
  }

  return events.filter((event) => {
    if (!event.seriesKey) {
      return true;
    }

    const key = `${event.gameId}::${event.seriesKey}::${event.title}`;

    return winnerByKey.get(key)?.id === event.id;
  });
}
