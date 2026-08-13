import { describe, expect, it } from "vitest";

import { collapseSeriesToLatest } from "./event-series";

function event(
  id: string,
  title: string,
  status: string,
  lastChecked: string,
  seriesKey: string | null = null,
  gameId = "lol"
) {
  return { id, gameId, title, status, lastChecked, seriesKey };
}

describe("collapseSeriesToLatest", () => {
  it("keeps events with no seriesKey untouched", () => {
    const events = [
      event("a", "Champion Rotation", "LIVE", "2026-08-01T00:00:00.000Z"),
      event("b", "Platform Status", "ENDED", "2026-08-01T00:00:00.000Z"),
    ];

    expect(collapseSeriesToLatest(events)).toEqual(events);
  });

  it("keeps the LIVE occurrence over an ENDED one when title and series both match", () => {
    const ended = event(
      "old",
      "Season 3: Act I",
      "ENDED",
      "2025-08-01T00:00:00.000Z",
      "lol-ranked-season-pass"
    );
    const live = event(
      "new",
      "Season 3: Act I",
      "LIVE",
      "2026-08-01T00:00:00.000Z",
      "lol-ranked-season-pass"
    );

    expect(collapseSeriesToLatest([ended, live])).toEqual([live]);
  });

  it("does not depend on input order", () => {
    const ended = event(
      "old",
      "Season 3: Act I",
      "ENDED",
      "2025-08-01T00:00:00.000Z",
      "lol-ranked-season-pass"
    );
    const live = event(
      "new",
      "Season 3: Act I",
      "LIVE",
      "2026-08-01T00:00:00.000Z",
      "lol-ranked-season-pass"
    );

    expect(collapseSeriesToLatest([live, ended])).toEqual([live]);
  });

  it("breaks a tie between two ENDED occurrences by most recent lastChecked", () => {
    const older = event(
      "a",
      "Season 3: Act I",
      "ENDED",
      "2025-01-01T00:00:00.000Z",
      "lol-ranked-season-pass"
    );
    const newer = event(
      "b",
      "Season 3: Act I",
      "ENDED",
      "2026-01-01T00:00:00.000Z",
      "lol-ranked-season-pass"
    );

    expect(collapseSeriesToLatest([older, newer])).toEqual([newer]);
  });

  it("does NOT collapse same-series events whose titles differ (e.g. Season 1: Act I vs Season 1: Act II)", () => {
    const events = [
      event(
        "s1a1",
        "Season 1: Act I",
        "ENDED",
        "2025-01-01T00:00:00.000Z",
        "lol-ranked-season-pass"
      ),
      event(
        "s1a2",
        "Season 1: Act II",
        "ENDED",
        "2025-03-01T00:00:00.000Z",
        "lol-ranked-season-pass"
      ),
      event(
        "s2a1",
        "Season 2: Act I",
        "ENDED",
        "2025-08-01T00:00:00.000Z",
        "lol-ranked-season-pass"
      ),
    ];

    expect(collapseSeriesToLatest(events)).toEqual(events);
  });

  it("does not collapse across different games sharing a title and series key", () => {
    const events = [
      event(
        "a",
        "Season 3: Act I",
        "ENDED",
        "2025-01-01T00:00:00.000Z",
        "ranked-season-pass",
        "lol"
      ),
      event(
        "b",
        "Season 3: Act I",
        "LIVE",
        "2026-01-01T00:00:00.000Z",
        "ranked-season-pass",
        "tft"
      ),
    ];

    expect(collapseSeriesToLatest(events)).toEqual(events);
  });

  it("keeps unrelated events alongside the collapsed one", () => {
    const events = [
      event("standalone", "Champion Rotation", "LIVE", "2026-08-01T00:00:00.000Z"),
      event(
        "series-a-old",
        "ARAM: Mayhem",
        "ENDED",
        "2025-01-01T00:00:00.000Z",
        "lol-mayhem-pass"
      ),
      event(
        "series-a-new",
        "ARAM: Mayhem",
        "LIVE",
        "2026-01-01T00:00:00.000Z",
        "lol-mayhem-pass"
      ),
      event(
        "series-b-only",
        "Hall of Legends",
        "TRACKING",
        "2026-01-01T00:00:00.000Z",
        "lol-hall-of-legends"
      ),
    ];

    const result = collapseSeriesToLatest(events);

    expect(result.map((e) => e.id)).toEqual([
      "standalone",
      "series-a-new",
      "series-b-only",
    ]);
  });
});
