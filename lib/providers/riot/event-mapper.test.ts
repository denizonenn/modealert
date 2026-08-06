import { describe, expect, it } from "vitest";

import { mapPlatformStatus } from "./event-mapper";

describe("riot mapPlatformStatus", () => {
  it("is LIVE when there are no maintenances", () => {
    const [event] = mapPlatformStatus({ id: "na1", maintenances: [] });

    expect(event.status).toBe("LIVE");
    expect(event.id).toBe("riot-platform-na1");
    expect(event.gameId).toBe("lol");
  });

  it("is TRACKING when maintenances are present", () => {
    const [event] = mapPlatformStatus({
      id: "na1",
      maintenances: [{ id: 1 }],
    });

    expect(event.status).toBe("TRACKING");
  });

  it("is LIVE when maintenances is absent entirely", () => {
    const [event] = mapPlatformStatus({ id: "euw1" });

    expect(event.status).toBe("LIVE");
  });
});
