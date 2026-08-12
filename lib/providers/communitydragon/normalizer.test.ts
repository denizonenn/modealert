import { describe, expect, it } from "vitest";

import {
  mapPbeCandidates,
  normalizeEventHub,
  toDisplayEvents,
} from "./normalizer";

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

  it("drops entries with a permanent/sentinel end date (not a real time-boxed event)", () => {
    const events = normalizeEventHub(
      [
        entry(
          "permanent",
          "2026-01-01T00:00:00.000Z",
          "2099-12-30T00:00:00.000Z",
          { localizedShortName: "Classic Player Level" }
        ),
        entry(
          "real",
          "2026-08-01T00:00:00.000Z",
          "2026-08-10T00:00:00.000Z"
        ),
      ],
      now
    );

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("communitydragon-event-real");
  });

  it("keeps rotating-mode season-pass wrappers (Mayhem/URF/Arena), categorized PLAYABLE (it's a real mode) with an honest hedge in the description", () => {
    const events = normalizeEventHub(
      [
        entry(
          "mayhem",
          "2026-06-10T00:00:00.000Z",
          "2026-10-06T00:00:00.000Z",
          {
            localizedShortName: "Mayhem Set 2",
            eventHubType: "kSeasonPass",
          }
        ),
        entry(
          "real",
          "2026-08-01T00:00:00.000Z",
          "2026-08-10T00:00:00.000Z"
        ),
      ],
      now
    );

    expect(events).toHaveLength(2);

    const mayhem = events.find((e) => e.id === "communitydragon-event-mayhem");

    expect(mayhem?.category).toBe("PLAYABLE");
    expect(mayhem?.description).toContain("battle-pass window only");
  });

  it("categorizes League Classic's pass (kDemaciaPass) as PLAYABLE — it represents a real mode, not just a reward track", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "classic",
          "2026-07-29T00:00:00.000Z",
          "2026-09-23T00:00:00.000Z",
          {
            localizedShortName: "Classic Pass: Act I",
            eventHubType: "kDemaciaPass",
          }
        ),
      ],
      now
    );

    expect(event.category).toBe("PLAYABLE");
  });

  it("categorizes a 'Token Bank' pass-currency entry as SEASON_PASS, not PLAYABLE", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "token-bank",
          "2026-07-29T00:00:00.000Z",
          "2026-09-23T00:00:00.000Z",
          { localizedShortName: "Classic Pass Token Bank" }
        ),
      ],
      now
    );

    expect(event.category).toBe("SEASON_PASS");
  });

  it("categorizes a regular event-hub entry as PLAYABLE by default", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "real",
          "2026-08-01T00:00:00.000Z",
          "2026-08-10T00:00:00.000Z"
        ),
      ],
      now
    );

    expect(event.category).toBe("PLAYABLE");
  });
});

describe("mapPbeCandidates", () => {
  it("only surfaces PBE entries not present on live", () => {
    const live = [
      entry("shared", "2026-08-01T00:00:00.000Z", "2026-08-10T00:00:00.000Z"),
    ];
    const pbe = [
      entry("shared", "2026-08-01T00:00:00.000Z", "2026-08-10T00:00:00.000Z"),
      entry(
        "new-on-pbe",
        "2026-09-01T00:00:00.000Z",
        "2026-09-10T00:00:00.000Z",
        { localizedShortName: "Mystery Mode" }
      ),
    ];

    const events = mapPbeCandidates(pbe, live, now);

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("communitydragon-pbe-new-on-pbe");
    expect(events[0].title).toBe("Mystery Mode (PBE Preview)");
    expect(events[0].status).toBe("UPCOMING");
  });

  it("returns nothing when PBE and live are identical", () => {
    const shared = [
      entry("1", "2026-08-01T00:00:00.000Z", "2026-08-10T00:00:00.000Z"),
    ];

    const events = mapPbeCandidates(shared, shared, now);

    expect(events).toHaveLength(0);
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
