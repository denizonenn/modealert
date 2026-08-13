import { describe, expect, it } from "vitest";

import { mapPlatformStatus, mapCurrentSet } from "./event-mapper";

describe("tft mapPlatformStatus", () => {
  it("is LIVE with no maintenances", () => {
    const [event] = mapPlatformStatus({ id: "na1", maintenances: [] });

    expect(event.status).toBe("LIVE");
    expect(event.gameId).toBe("tft");
  });

  it("is TRACKING with maintenances present", () => {
    const [event] = mapPlatformStatus({
      id: "na1",
      maintenances: [{ id: 1 }],
    });

    expect(event.status).toBe("TRACKING");
  });

  it("is LIVE when maintenances is absent entirely", () => {
    const [event] = mapPlatformStatus({ id: "na1" });

    expect(event.status).toBe("LIVE");
  });
});

describe("tft mapCurrentSet", () => {
  it("picks the highest numeric set key as the current set", () => {
    const [event] = mapCurrentSet({
      sets: {
        "1": { name: "Set1" },
        "13": { name: "Set13" },
        "7": { name: "Set7" },
      },
    });

    expect(event.title).toBe("Set 13");
    expect(event.id).toBe("tft-set-13");
    expect(event.status).toBe("LIVE");
    expect(event.seriesKey).toBe("tft-set");
  });

  it("returns no events when sets is empty", () => {
    const events = mapCurrentSet({ sets: {} });

    expect(events).toHaveLength(0);
  });

  it("ignores non-numeric set keys", () => {
    const [event] = mapCurrentSet({
      sets: {
        "5": { name: "Set5" },
        tutorial: { name: "Tutorial" },
      },
    });

    expect(event.title).toBe("Set 5");
  });
});
