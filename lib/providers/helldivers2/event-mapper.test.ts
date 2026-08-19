import { describe, expect, it } from "vitest";

import { mapAssignments } from "./event-mapper";

const HOUR = 3_600_000;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

describe("helldivers2 mapAssignments", () => {
  it("maps an active assignment to a LIVE event with the briefing as description", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: "MAJOR ORDER",
        briefing: "Liberate the designated planet.",
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    expect(events).toHaveLength(1);
    expect(events[0].status).toBe("LIVE");
    expect(events[0].id).toBe("helldivers2-assignment-1");
    expect(events[0].title).toBe("MAJOR ORDER");
    expect(events[0].description).toBe(
      "Liberate the designated planet."
    );
  });

  it("drops assignments whose expiration is already in the past", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: "MAJOR ORDER",
        briefing: "Old order.",
        description: null,
        expiration: iso(-HOUR),
      },
    ]);

    expect(events).toHaveLength(0);
  });

  it("keeps long briefings intact in the description (no truncation)", () => {
    const longBriefing = "A".repeat(150);

    const events = mapAssignments([
      {
        id: 1,
        title: "MAJOR ORDER",
        briefing: longBriefing,
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    expect(events[0].title).toBe("MAJOR ORDER");
    expect(events[0].description).toBe(longBriefing);
  });

  it("falls back to a default title and generic description when both are missing", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: null,
        briefing: null,
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    expect(events[0].title).toBe("Major Order");
    expect(events[0].description).toBe(
      "Major Order — an active Helldivers 2 community objective."
    );
  });

  it("maps multiple concurrent assignments independently", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: "MAJOR ORDER",
        briefing: "First.",
        description: null,
        expiration: iso(HOUR),
      },
      {
        id: 2,
        title: "STRATEGIC THREAT",
        briefing: "Second.",
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    expect(events).toHaveLength(2);
    expect(events.map((e) => e.id)).toEqual([
      "helldivers2-assignment-1",
      "helldivers2-assignment-2",
    ]);
  });
});
