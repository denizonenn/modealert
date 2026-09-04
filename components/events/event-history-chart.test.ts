import { describe, expect, it } from "vitest";

import {
  computeHistoryChartLayout,
  formatDuration,
  type HistoryOccurrence,
} from "./event-history-chart";

const DAY = 24 * 60 * 60 * 1000;

function occ(id: string, startedAt: string, endedAt: string | null): HistoryOccurrence {
  return {
    id,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
  };
}

describe("computeHistoryChartLayout", () => {
  it("spans from the earliest start to the latest end for all-completed occurrences", () => {
    const now = new Date("2026-09-05T00:00:00Z").getTime();
    const layout = computeHistoryChartLayout(
      [
        occ("a", "2026-08-15T08:00:00Z", "2026-08-18T08:00:00Z"),
        occ("b", "2026-08-22T08:00:00Z", "2026-08-26T08:00:00Z"),
      ],
      now
    );

    expect(layout.domainStart).toBe(new Date("2026-08-15T08:00:00Z").getTime());
    expect(layout.domainEnd).toBe(new Date("2026-08-26T08:00:00Z").getTime());
    expect(layout.bars).toHaveLength(2);
  });

  it("extends the domain to `now` when the most recent occurrence is still ongoing", () => {
    const now = new Date("2026-09-05T00:00:00Z").getTime();
    const layout = computeHistoryChartLayout(
      [occ("a", "2026-08-15T08:00:00Z", "2026-08-18T08:00:00Z"), occ("b", "2026-09-01T08:00:00Z", null)],
      now
    );

    expect(layout.domainEnd).toBe(now);

    const ongoingBar = layout.bars.find((b) => b.id === "b")!;
    expect(ongoingBar.isOngoing).toBe(true);
    expect(ongoingBar.durationMs).toBe(now - new Date("2026-09-01T08:00:00Z").getTime());
  });

  it("does not stretch the domain out to `now` when nothing is ongoing", () => {
    // now is well after the only (completed) occurrence — an event
    // that finished long ago and never recurred shouldn't have its
    // one real bar squeezed into a sliver just to reach today's date.
    const now = new Date("2026-08-20T00:00:00Z").getTime();
    const layout = computeHistoryChartLayout(
      [occ("a", "2026-08-15T00:00:00Z", "2026-08-18T00:00:00Z")],
      now
    );

    expect(layout.domainEnd).toBe(new Date("2026-08-18T00:00:00Z").getTime());
    expect(layout.bars[0].x1).toBe(1000);
  });

  it("never divides by zero when every occurrence starts and ends at the same instant as `now`", () => {
    const now = new Date("2026-08-15T00:00:00Z").getTime();
    const layout = computeHistoryChartLayout(
      [occ("a", "2026-08-15T00:00:00Z", "2026-08-15T00:00:00Z")],
      now
    );

    expect(Number.isFinite(layout.bars[0].x0)).toBe(true);
    expect(Number.isFinite(layout.bars[0].x1)).toBe(true);
  });

  it("gives every bar at least a 6px-equivalent minimum width even when duration rounds to ~0", () => {
    const now = new Date("2026-09-05T00:00:00Z").getTime();
    const layout = computeHistoryChartLayout(
      [
        occ("a", "2026-08-15T00:00:00Z", "2026-08-15T00:00:01Z"),
        occ("b", "2026-09-01T00:00:00Z", null),
      ],
      now
    );

    expect(layout.bars[0].barWidth).toBeGreaterThanOrEqual(6);
  });

  it("keeps rows in input order, stacked top to bottom by increasing y", () => {
    const now = new Date("2026-09-05T00:00:00Z").getTime();
    const layout = computeHistoryChartLayout(
      [
        occ("a", "2026-08-15T00:00:00Z", "2026-08-16T00:00:00Z"),
        occ("b", "2026-08-20T00:00:00Z", "2026-08-21T00:00:00Z"),
      ],
      now
    );

    expect(layout.bars[0].y).toBeLessThan(layout.bars[1].y);
  });

  it("caps to the most recent N occurrences", () => {
    const now = new Date("2026-09-05T00:00:00Z").getTime();
    const many = Array.from({ length: 5 }, (_, i) =>
      occ(`e${i}`, `2026-08-${10 + i}T00:00:00Z`, `2026-08-${11 + i}T00:00:00Z`)
    );

    const layout = computeHistoryChartLayout(many, now, 2);

    expect(layout.bars.map((b) => b.id)).toEqual(["e3", "e4"]);
  });
});

describe("formatDuration", () => {
  it("shows days and hours when at least a full day has passed", () => {
    expect(formatDuration(2 * DAY + 3 * 60 * 60 * 1000)).toBe("2d 3h");
  });

  it("shows only hours under a day", () => {
    expect(formatDuration(5 * 60 * 60 * 1000)).toBe("5h");
  });

  it("shows 0h for a near-instant duration", () => {
    expect(formatDuration(1000)).toBe("0h");
  });
});
