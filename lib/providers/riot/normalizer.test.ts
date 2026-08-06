import { describe, expect, it } from "vitest";

import { normalizeRiotEvent, normalizeRiotEvents } from "./normalizer";

describe("normalizeRiotEvent", () => {
  it("passes through known statuses as-is", () => {
    const event = normalizeRiotEvent({
      id: "e1",
      gameId: "lol",
      title: "Test Event",
      status: "LIVE",
      trackedUsers: 5,
      checkedAt: "2026-08-06T10:00:00.000Z",
    });

    expect(event.status).toBe("LIVE");
    expect(event.checkedAt).toEqual(new Date("2026-08-06T10:00:00.000Z"));
  });

  it("falls back to UPCOMING for an unknown status", () => {
    const event = normalizeRiotEvent({
      id: "e2",
      gameId: "lol",
      title: "Test Event",
      status: "SOMETHING_NEW",
      trackedUsers: 0,
      checkedAt: "2026-08-06T10:00:00.000Z",
    });

    expect(event.status).toBe("UPCOMING");
  });
});

describe("normalizeRiotEvents", () => {
  it("normalizes every event in the list", () => {
    const events = normalizeRiotEvents([
      {
        id: "e1",
        gameId: "lol",
        title: "A",
        status: "LIVE",
        trackedUsers: 1,
        checkedAt: "2026-08-06T10:00:00.000Z",
      },
      {
        id: "e2",
        gameId: "lol",
        title: "B",
        status: "ENDED",
        trackedUsers: 2,
        checkedAt: "2026-08-06T11:00:00.000Z",
      },
    ]);

    expect(events).toHaveLength(2);
    expect(events.map((e) => e.status)).toEqual(["LIVE", "ENDED"]);
  });
});
