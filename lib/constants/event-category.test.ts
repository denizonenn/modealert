import { describe, expect, it } from "vitest";

import { categorySortKey, matchesRotationFilter } from "./event-category";

describe("categorySortKey", () => {
  it("ranks a PLAYABLE event above a PLATFORM_STATUS event, even ENDED vs LIVE", () => {
    const endedPlayable = categorySortKey("PLAYABLE", true, 3);
    const livePlatformStatus = categorySortKey("PLATFORM_STATUS", false, 0);

    expect(endedPlayable).toBeLessThan(livePlatformStatus);
  });

  it("ranks limited-time above permanent within the same category", () => {
    const limited = categorySortKey("PLAYABLE", true, 2);
    const permanent = categorySortKey("PLAYABLE", false, 0);

    expect(limited).toBeLessThan(permanent);
  });

  it("falls back to status priority as the final tiebreak", () => {
    const live = categorySortKey("PLAYABLE", true, 0);
    const ended = categorySortKey("PLAYABLE", true, 3);

    expect(live).toBeLessThan(ended);
  });

  it("treats an unknown category the same as PLAYABLE", () => {
    expect(categorySortKey("SOMETHING_NEW", true, 0)).toBe(
      categorySortKey("PLAYABLE", true, 0)
    );
  });
});

describe("matchesRotationFilter", () => {
  it("matches limited-time events only when \"limited\" is selected", () => {
    expect(matchesRotationFilter(true, new Set(["limited"]))).toBe(true);
    expect(matchesRotationFilter(true, new Set(["permanent"]))).toBe(false);
  });

  it("matches permanent events only when \"permanent\" is selected", () => {
    expect(matchesRotationFilter(false, new Set(["permanent"]))).toBe(true);
    expect(matchesRotationFilter(false, new Set(["limited"]))).toBe(false);
  });

  it("matches everything when both filters are selected", () => {
    const both = new Set<"limited" | "permanent">(["limited", "permanent"]);

    expect(matchesRotationFilter(true, both)).toBe(true);
    expect(matchesRotationFilter(false, both)).toBe(true);
  });
});
