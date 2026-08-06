import { describe, expect, it } from "vitest";

import { mapAssignments } from "./event-mapper";

const HOUR = 3_600_000;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

describe("helldivers2 mapAssignments", () => {
  it("maps an active assignment to a LIVE event", () => {
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
    expect(events[0].title).toBe(
      "MAJOR ORDER: Liberate the designated planet."
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

  it("truncates long briefings to 100 characters with an ellipsis", () => {
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

    expect(events[0].title).toBe(`MAJOR ORDER: ${"A".repeat(100)}…`);
  });

  it("falls back to the label alone when briefing is missing", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: "MAJOR ORDER",
        briefing: null,
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    expect(events[0].title).toBe("MAJOR ORDER");
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
