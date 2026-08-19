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

  it("categorizes Mayhem's pass window as a plain SEASON_PASS — Mayhem is now a confirmed-permanent mode with its own dedicated entry, no hedge needed", () => {
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

    expect(mayhem?.title).toBe("Mayhem Set 2");
    expect(mayhem?.category).toBe("SEASON_PASS");
    expect(mayhem?.description).not.toContain("battle-pass window only");
  });

  it("categorizes League Classic's pass (kDemaciaPass) as SEASON_PASS — League Classic has its own dedicated PLAYABLE entry now", () => {
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

    expect(event.title).toBe("Classic Pass: Act I");
    expect(event.category).toBe("SEASON_PASS");
  });

  it("still renames URF/Arena pass-tier titles to the real mode name — no dedicated permanent entry exists for those yet", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "urf",
          "2026-06-10T00:00:00.000Z",
          "2026-10-06T00:00:00.000Z",
          {
            localizedShortName: "URF Set 2",
            eventHubType: "kSeasonPass",
          }
        ),
      ],
      now
    );

    expect(event.title).toBe("URF");
    expect(event.category).toBe("PLAYABLE");
    expect(event.description).toContain("battle-pass window only");
  });

  it("derives 'ARAM: Mayhem Classic-ish' status from League Classic's real pass window, not a static guess", () => {
    const liveClassic = normalizeEventHub(
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

    const companionLive = liveClassic.find(
      (e) => e.id === "lol-mode-aram-mayhem-classic"
    );

    expect(companionLive?.title).toBe("ARAM: Mayhem Classic-ish");
    expect(companionLive?.status).toBe("LIVE");
    expect(companionLive?.category).toBe("PLAYABLE");

    const endedClassic = normalizeEventHub(
      [
        entry(
          "classic-old",
          "2026-01-01T00:00:00.000Z",
          "2026-02-01T00:00:00.000Z",
          {
            localizedShortName: "Classic Pass: Act 0",
            eventHubType: "kDemaciaPass",
          }
        ),
      ],
      now
    );

    const companionEnded = endedClassic.find(
      (e) => e.id === "lol-mode-aram-mayhem-classic"
    );

    expect(companionEnded?.status).toBe("ENDED");
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

  it("marks an event TRACKING when now is past progressEndDate but before endDate", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "pass",
          "2026-07-29T18:00:00.000Z",
          "2026-09-23T06:59:00.000Z",
          {
            localizedShortName: "Classic Pass: Act I",
            eventHubType: "kDemaciaPass",
            progressEndDate: "2026-08-01T00:00:00.000Z",
          }
        ),
      ],
      now
    );

    expect(event.status).toBe("TRACKING");
    expect(event.description).toContain("Pass progress has closed");
  });

  it("stays LIVE when now is before progressEndDate", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "pass",
          "2026-07-29T18:00:00.000Z",
          "2026-09-23T06:59:00.000Z",
          {
            localizedShortName: "Classic Pass: Act I",
            eventHubType: "kDemaciaPass",
            progressEndDate: "2026-09-01T00:00:00.000Z",
          }
        ),
      ],
      now
    );

    expect(event.status).toBe("LIVE");
    expect(event.description).not.toContain("Pass progress has closed");
  });

  it("ignores a missing progressEndDate and stays LIVE for the full window", () => {
    const [event] = normalizeEventHub(
      [
        entry(
          "no-progress-field",
          "2026-08-01T00:00:00.000Z",
          "2026-08-10T00:00:00.000Z"
        ),
      ],
      now
    );

    expect(event.status).toBe("LIVE");
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

describe("seriesKey grouping", () => {
  it("groups Mayhem's pass windows under one series key", () => {
    const [event] = normalizeEventHub(
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
      ],
      now
    );

    expect(event.seriesKey).toBe("lol-mayhem-pass");
  });

  it("groups ranked season passes ('Season N: Act X') under one series key regardless of year", () => {
    const events = normalizeEventHub(
      [
        entry(
          "s3-2025",
          "2025-08-27T00:00:00.000Z",
          "2025-10-22T00:00:00.000Z",
          {
            localizedShortName: "Season 3: Act I",
            eventHubType: "kSeasonPass",
          }
        ),
        entry(
          "s3-2026",
          "2026-07-29T00:00:00.000Z",
          "2026-10-07T00:00:00.000Z",
          {
            localizedShortName: "Season 3: Act I",
            eventHubType: "kSeasonPass",
          }
        ),
      ],
      now
    );

    expect(events.every((e) => e.seriesKey === "lol-ranked-season-pass")).toBe(
      true
    );
  });

  it("groups Hall of Legends across years under one series key", () => {
    const events = normalizeEventHub(
      [
        entry(
          "hol-2024",
          "2024-06-12T00:00:00.000Z",
          "2024-07-15T00:00:00.000Z",
          {
            localizedShortName: "Hall of Legends",
            eventHubType: "kHallOfLegends",
          }
        ),
        entry(
          "hol-2025",
          "2025-06-11T00:00:00.000Z",
          "2025-07-30T00:00:00.000Z",
          {
            localizedShortName: "Hall of Legends 2025",
            eventHubType: "kHallOfLegends",
          }
        ),
      ],
      now
    );

    expect(events.every((e) => e.seriesKey === "lol-hall-of-legends")).toBe(
      true
    );
  });

  it("does NOT group one-off narrative campaigns — they aren't the same recurring thing", () => {
    const events = normalizeEventHub(
      [
        entry(
          "noxus",
          "2025-01-09T00:00:00.000Z",
          "2025-03-05T00:00:00.000Z",
          {
            localizedShortName: "Welcome to Noxus: Act 1",
            eventHubType: "kSeasonPass",
          }
        ),
        entry(
          "spirit-blossom",
          "2025-04-30T00:00:00.000Z",
          "2025-06-25T00:00:00.000Z",
          {
            localizedShortName: "Spirit Blossom Beyond: Act 1",
            eventHubType: "kSeasonPass",
          }
        ),
      ],
      now
    );

    expect(events.every((e) => e.seriesKey === undefined)).toBe(true);
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
