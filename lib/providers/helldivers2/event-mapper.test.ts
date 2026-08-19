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
    expect(events[0].title).toBe(
      "Major Order: Liberate the designated planet"
    );
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

    expect(events[0].title.length).toBeLessThan(90);
    expect(events[0].title.endsWith("…")).toBe(true);
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

  it("gives each order a distinct title from its briefing, not the API's shared category label", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: "MAJOR ORDER",
        briefing:
          "Liberate Seasse to protect the Ministry of Science expeditionary teams.",
        description: null,
        expiration: iso(HOUR),
      },
      {
        id: 2,
        title: "MAJOR ORDER",
        briefing: "Hold Rirga Bay against the incoming assault.",
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    // The real bug this fixes: both of these came back as "MAJOR ORDER".
    expect(events[0].title).not.toBe(events[1].title);
    expect(events[0].title).toContain("Liberate Seasse");
    expect(events[1].title).toContain("Hold Rirga Bay");
  });

  it("preserves the real order kind, title-cased rather than shouted", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: "STRATEGIC THREAT",
        briefing: "Repel the invasion.",
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    expect(events[0].title).toBe("Strategic Threat: Repel the invasion");
  });

  it("uses just the kind when there's no briefing to summarize", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: "MAJOR ORDER",
        briefing: null,
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    expect(events[0].title).toBe("Major Order");
  });

  it("truncates a long objective on a word boundary, not mid-word", () => {
    const events = mapAssignments([
      {
        id: 1,
        title: "MAJOR ORDER",
        briefing:
          "Liberate the designated planet and defend the supply corridor against overwhelming Terminid resistance.",
        description: null,
        expiration: iso(HOUR),
      },
    ]);

    const title = events[0].title;

    expect(title.endsWith("…")).toBe(true);
    // No partial word immediately before the ellipsis.
    expect(title.replace("…", "").endsWith(" ")).toBe(false);
    expect(
      events[0].description?.startsWith("Liberate the designated planet")
    ).toBe(true);
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
