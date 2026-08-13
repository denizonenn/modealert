import { describe, expect, it } from "vitest";

import { weeklyDigestService } from "./weekly-digest.service";

describe("weeklyDigestService.shouldRunToday", () => {
  it("is true on a Monday", () => {
    // 2026-08-17 is a Monday.
    expect(
      weeklyDigestService.shouldRunToday(
        new Date("2026-08-17T08:00:00.000Z")
      )
    ).toBe(true);
  });

  it("is false on any other day", () => {
    // 2026-08-13 is a Thursday.
    expect(
      weeklyDigestService.shouldRunToday(
        new Date("2026-08-13T08:00:00.000Z")
      )
    ).toBe(false);
  });
});
