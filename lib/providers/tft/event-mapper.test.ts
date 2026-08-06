import { describe, expect, it } from "vitest";

import { mapPlatformStatus } from "./event-mapper";

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
