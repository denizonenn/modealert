import { describe, expect, it } from "vitest";

import { computeRecurrence } from "./event-prediction.service";

function occurrence(startedAt: string, endedAt: string | null) {
  return {
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
  };
}

describe("computeRecurrence", () => {
  it("returns no average when fewer than 2 completed occurrences exist", () => {
    const result = computeRecurrence([
      occurrence("2026-01-01T00:00:00.000Z", "2026-01-10T00:00:00.000Z"),
    ]);

    expect(result.averageGapMs).toBeNull();
    expect(result.gapCount).toBe(0);
  });

  it("computes the gap between the end of one occurrence and the start of the next", () => {
    const result = computeRecurrence([
      occurrence("2026-01-01T00:00:00.000Z", "2026-01-10T00:00:00.000Z"),
      occurrence("2026-02-01T00:00:00.000Z", "2026-02-10T00:00:00.000Z"),
    ]);

    const expectedGap =
      new Date("2026-02-01T00:00:00.000Z").getTime() -
      new Date("2026-01-10T00:00:00.000Z").getTime();

    expect(result.averageGapMs).toBe(expectedGap);
    expect(result.gapCount).toBe(1);
  });

  it("averages multiple gaps across 3+ occurrences", () => {
    const result = computeRecurrence([
      occurrence("2026-01-01T00:00:00.000Z", "2026-01-05T00:00:00.000Z"),
      occurrence("2026-01-15T00:00:00.000Z", "2026-01-20T00:00:00.000Z"),
      occurrence("2026-02-19T00:00:00.000Z", "2026-02-25T00:00:00.000Z"),
    ]);

    // gap 1: Jan 5 -> Jan 15 = 10 days. gap 2: Jan 20 -> Feb 19 = 30 days.
    const tenDays = 10 * 24 * 60 * 60 * 1000;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    expect(result.averageGapMs).toBe((tenDays + thirtyDays) / 2);
    expect(result.gapCount).toBe(2);
  });

  it("excludes back-to-back occurrences with no real gap (e.g. Act I rolling straight into Act II)", () => {
    const result = computeRecurrence([
      occurrence("2026-01-01T00:00:00.000Z", "2026-01-10T00:00:00.000Z"),
      // Starts exactly when the previous one ended — zero gap.
      occurrence("2026-01-10T00:00:00.000Z", "2026-01-20T00:00:00.000Z"),
      occurrence("2026-03-01T00:00:00.000Z", "2026-03-10T00:00:00.000Z"),
    ]);

    // Only the Jan 20 -> Mar 1 gap counts.
    expect(result.gapCount).toBe(1);
  });

  it("ignores the currently-ongoing occurrence (no endedAt) when computing gaps", () => {
    const result = computeRecurrence([
      occurrence("2026-01-01T00:00:00.000Z", "2026-01-10T00:00:00.000Z"),
      occurrence("2026-06-01T00:00:00.000Z", null),
    ]);

    expect(result.averageGapMs).toBeNull();
    expect(result.gapCount).toBe(0);
  });
});
