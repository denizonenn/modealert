import { describe, expect, it } from "vitest";

import { mapQueueStatuses } from "./event-mapper";

import type { ClientConfigResponse } from "./types";

function regionConfig(
  region: string,
  queues: { queueId: number; isEnabled: boolean; isVisibleInClient: boolean }[]
): ClientConfigResponse {
  return {
    [`lol.${region}.operational.queues.queueConfigs`]: queues,
  };
}

describe("mapQueueStatuses", () => {
  it("marks a queue ENDED when it's disabled everywhere", () => {
    const configsByRegion = {
      na1: regionConfig("na1", [
        { queueId: 900, isEnabled: false, isVisibleInClient: false },
      ]),
      euw1: regionConfig("euw1", [
        { queueId: 900, isEnabled: false, isVisibleInClient: false },
      ]),
    };

    const events = mapQueueStatuses(configsByRegion);
    const urf = events.find((e) => e.id === "lol-live-urf");

    expect(urf?.status).toBe("ENDED");
  });

  it("marks a queue LIVE when it's enabled and visible in at least one region", () => {
    const configsByRegion = {
      na1: regionConfig("na1", [
        { queueId: 1700, isEnabled: false, isVisibleInClient: false },
      ]),
      euw1: regionConfig("euw1", [
        { queueId: 1700, isEnabled: true, isVisibleInClient: true },
      ]),
    };

    const events = mapQueueStatuses(configsByRegion);
    const arena = events.find((e) => e.id === "lol-live-arena");

    expect(arena?.status).toBe("LIVE");
    expect(arena?.description).toContain("EUW1");
    expect(arena?.description).not.toContain("NA1");
  });

  it("only reads a region's status from that region's OWN response, not another region's bundled copy of it", () => {
    // Regression test for the real bug caught 2026-08-13: a response
    // fetched for one region bundles (stale/wrong) dotted keys for
    // every other region too. If mapQueueStatuses ever started reading
    // e.g. configsByRegion["na1"]["lol.euw1...."] as a stand-in for
    // euw1's real status, this would silently start passing on wrong
    // data again.
    const configsByRegion = {
      na1: {
        "lol.na1.operational.queues.queueConfigs": [
          { queueId: 900, isEnabled: false, isVisibleInClient: false },
        ],
        // A stale/wrong copy of euw1's key bundled into na1's own
        // response — must NOT be used to decide euw1's status.
        "lol.euw1.operational.queues.queueConfigs": [
          { queueId: 900, isEnabled: true, isVisibleInClient: true },
        ],
      },
      euw1: regionConfig("euw1", [
        { queueId: 900, isEnabled: false, isVisibleInClient: false },
      ]),
    };

    const events = mapQueueStatuses(configsByRegion);
    const urf = events.find((e) => e.id === "lol-live-urf");

    expect(urf?.status).toBe("ENDED");
  });

  it("treats isEnabled without isVisibleInClient as not live", () => {
    const configsByRegion = {
      na1: regionConfig("na1", [
        { queueId: 900, isEnabled: true, isVisibleInClient: false },
      ]),
    };

    const events = mapQueueStatuses(configsByRegion);
    const urf = events.find((e) => e.id === "lol-live-urf");

    expect(urf?.status).toBe("ENDED");
  });

  it("treats no regions at all as not live for everything, not a crash", () => {
    const events = mapQueueStatuses({});

    expect(events.every((e) => e.status === "ENDED")).toBe(true);
  });

  it("gives every known queue its own distinct title, even ones Riot internally both call URF", () => {
    const configsByRegion = {
      na1: regionConfig("na1", [
        { queueId: 900, isEnabled: true, isVisibleInClient: true },
        { queueId: 1900, isEnabled: true, isVisibleInClient: true },
      ]),
    };

    const events = mapQueueStatuses(configsByRegion);
    const titles = events.map((e) => e.title);

    expect(new Set(titles).size).toBe(titles.length);
    expect(titles).toContain("URF");
    expect(titles).toContain("Pick URF");
  });

  it("always returns every known queue regardless of live status, so it stays trackable", () => {
    const events = mapQueueStatuses({});

    expect(events.map((e) => e.id).sort()).toEqual(
      [
        "lol-live-arena",
        "lol-live-arena-3x6",
        "lol-live-bravery-arena",
        "lol-live-pick-urf",
        "lol-live-urf",
      ].sort()
    );
  });
});
