import { describe, expect, it } from "vitest";

import { mapSbcActivity } from "./event-mapper";

import type { FutGgSbc } from "./types";

function sbc(overrides: Partial<FutGgSbc> = {}): FutGgSbc {
  return {
    id: 1,
    name: "Test SBC",
    endTime: "2099-01-01T00:00:00Z",
    isRepeatable: false,
    ...overrides,
  };
}

describe("mapSbcActivity", () => {
  it("is LIVE and counts only real, near-term SBCs", () => {
    const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const later = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    const [event] = mapSbcActivity([
      sbc({ id: 1, endTime: soon }),
      sbc({ id: 2, endTime: later }),
    ]);

    expect(event.status).toBe("LIVE");
    expect(event.title).toBe("Squad Building Challenges (2 active)");
  });

  it("excludes sentinel-dated permanent SBCs (e.g. tutorials)", () => {
    const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const [event] = mapSbcActivity([
      sbc({ id: 1, endTime: soon }),
      sbc({ id: 2, endTime: "2035-07-30T17:00:00Z" }),
    ]);

    expect(event.title).toBe("Squad Building Challenges (1 active)");
  });

  it("excludes already-expired SBCs", () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const [event] = mapSbcActivity([sbc({ endTime: past })]);

    expect(event.title).toBe("Squad Building Challenges (0 active)");
    expect(event.status).toBe("TRACKING");
  });

  it("is TRACKING with a null-safe description when nothing is active", () => {
    const [event] = mapSbcActivity([]);

    expect(event.status).toBe("TRACKING");
    expect(event.description).toBe(
      "No time-boxed Squad Building Challenges currently active."
    );
  });
});
