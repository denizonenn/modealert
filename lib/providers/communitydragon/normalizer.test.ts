import { describe, expect, it } from "vitest";

import { normalizeEventHub, toDisplayEvents } from "./normalizer";

import type { CommunityDragonEventHubResponse } from "./types";

const now = new Date("2026-08-06T12:00:00.000Z");

function entry(
  eventId: string,
  startDate: string,
  endDate: string,
  overrides: Partial<CommunityDragonEventHubResponse[number]["event"]> = {}
): CommunityDragonEventHubResponse[number] {
  return {
    event: {
      eventId,
      eventHubType: "seasonal",
      localizedName: `Event ${eventId}`,
      startDate,
      endDate,
      ...overrides,
    },
  };
}

describe("normalizeEventHub", () => {
  it("marks an event LIVE when now is between start and end", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "1",
          "2026-08-01T00:00:00.000Z",
          "2026-08-10T00:00:00.000Z"
        ),
      ],
      now
    );

    expect(event.status).toBe("LIVE");
    expect(event.id).toBe("communitydragon-event-1");
    expect(event.gameId).toBe("lol");
  });

  it("marks an event UPCOMING when now is before start", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "2",
          "2026-09-01T00:00:00.000Z",
          "2026-09-10T00:00:00.000Z"
        ),
      ],
      now
    );

    expect(event.status).toBe("UPCOMING");
  });

  it("marks an event ENDED when now is after end", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "3",
          "2026-07-01T00:00:00.000Z",
          "2026-07-10T00:00:00.000Z"
        ),
      ],
      now
    );

    expect(event.status).toBe("ENDED");
  });

  it("prefers the short name when present", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "4",
          "2026-08-01T00:00:00.000Z",
          "2026-08-10T00:00:00.000Z",
          { localizedShortName: "Short" }
        ),
      ],
      now
    );

    expect(event.title).toBe("Short");
  });
});

describe("toDisplayEvents", () => {
  it("sorts by start date ascending", () => {
    const events = toDisplayEvents(
      [
        entry(
          "later",
          "2026-08-05T00:00:00.000Z",
          "2026-08-20T00:00:00.000Z"
        ),
        entry(
          "earlier",
          "2026-08-01T00:00:00.000Z",
          "2026-08-15T00:00:00.000Z"
        ),
      ],
      now
    );

    expect(events.map((e) => e.id)).toEqual(["earlier", "later"]);
  });
});
