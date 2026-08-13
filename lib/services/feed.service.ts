import { getRecentHistory } from "@/lib/repositories/event-history.repository";
import { getRecentChanges } from "@/lib/repositories/event-change.repository";

export interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  guid: string;
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  status: "Status",
  category: "Category",
  isLimitedTime: "Permanence",
};

function eventLink(event: { slug: string | null; game: { slug: string } }) {
  return event.slug ? `/events/${event.slug}` : `/games/${event.game.slug}`;
}

const ITEMS_PER_SOURCE = 40;

// Combines two real, already-recorded sources into one timeline — no
// item here is inferred or generated, both tables already exist for
// their own reasons (EventHistory: LIVE/TRACKING occurrence windows,
// see ADR-002; EventChange: field-level edits, see ADR-039) and
// simply weren't syndicated anywhere before. See docs/06_DECISIONS.md
// ADR-048.
export async function getRecentFeedItems(
  limit: number
): Promise<FeedItem[]> {
  const [history, changes] = await Promise.all([
    getRecentHistory(ITEMS_PER_SOURCE),
    getRecentChanges(ITEMS_PER_SOURCE),
  ]);

  const historyItems: FeedItem[] = history.map((entry) => ({
    title: `${entry.event.title} is now ${entry.status} — ${entry.event.game.name}`,
    description:
      entry.event.description ??
      `${entry.event.title} (${entry.event.game.name}) started a new ${entry.status} window.`,
    link: eventLink(entry.event),
    pubDate: entry.startedAt,
    guid: `history-${entry.id}`,
  }));

  const changeItems: FeedItem[] = changes.map((change) => ({
    title: `${change.event.title}: ${FIELD_LABELS[change.field] ?? change.field} changed — ${change.event.game.name}`,
    description: `${change.oldValue ?? "—"} → ${change.newValue ?? "—"}`,
    link: eventLink(change.event),
    pubDate: change.changedAt,
    guid: `change-${change.id}`,
  }));

  return [...historyItems, ...changeItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, limit);
}
