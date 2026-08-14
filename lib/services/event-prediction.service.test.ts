import { describe, expect, it } from "vitest";

import {
  computeRecurrence,
  predictFromResearchedCadence,
} from "./event-prediction.service";

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

describe("predictFromResearchedCadence", () => {
  const EVENT_ID = "poe-current-league";
  // Real anchor from researched-cadences.ts: 2026-07-24T20:00:00.000Z,
  // 98-day interval.
  const ANCHOR = new Date("2026-07-24T20:00:00.000Z");
  const DAY_MS = 24 * 60 * 60 * 1000;

  it("returns null for an event with no researched cadence", () => {
    expect(
      predictFromResearchedCadence("some-untracked-event", new Date())
    ).toBeNull();
  });

  it("predicts the end of the current cycle shortly after the anchor", () => {
    const now = new Date(ANCHOR.getTime() + DAY_MS);
    const result = predictFromResearchedCadence(EVENT_ID, now);

    expect(result?.predictedEndAt.getTime()).toBe(
      ANCHOR.getTime() + 98 * DAY_MS
    );
    expect(result?.researched).toBe(true);
  });

  it("stays in the same cycle right up until it ends", () => {
    const now = new Date(ANCHOR.getTime() + 97 * DAY_MS);
    const result = predictFromResearchedCadence(EVENT_ID, now);

    expect(result?.predictedEndAt.getTime()).toBe(
      ANCHOR.getTime() + 98 * DAY_MS
    );
  });

  it("rolls over to the next cycle once the interval has passed", () => {
    const now = new Date(ANCHOR.getTime() + 99 * DAY_MS);
    const result = predictFromResearchedCadence(EVENT_ID, now);

    expect(result?.predictedEndAt.getTime()).toBe(
      ANCHOR.getTime() + 196 * DAY_MS
    );
  });

  it("clamps to the first cycle if called before the anchor date", () => {
    const now = new Date(ANCHOR.getTime() - 10 * DAY_MS);
    const result = predictFromResearchedCadence(EVENT_ID, now);

    expect(result?.predictedEndAt.getTime()).toBe(
      ANCHOR.getTime() + 98 * DAY_MS
    );
  });

  it("carries the real source citation and caveats through", () => {
    const result = predictFromResearchedCadence(EVENT_ID, new Date());

    expect(result?.source).toContain("GGG");
    expect(result?.caveats).toContain("Settlers of Kalguur");
  });
});
