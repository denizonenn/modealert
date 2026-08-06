import { describe, expect, it } from "vitest";

import { mapActiveMilestones, mapPlatformStatus } from "./event-mapper";

describe("destiny mapPlatformStatus", () => {
  it("is LIVE when Destiny2 system is enabled", () => {
    const [event] = mapPlatformStatus({
      systems: { Destiny2: { enabled: true } },
    });

    expect(event.status).toBe("LIVE");
    expect(event.gameId).toBe("destiny");
  });

  it("is TRACKING when Destiny2 system is disabled", () => {
    const [event] = mapPlatformStatus({
      systems: { Destiny2: { enabled: false } },
    });

    expect(event.status).toBe("TRACKING");
  });

  it("defaults to LIVE when the Destiny2 system entry is missing", () => {
    const [event] = mapPlatformStatus({ systems: {} });

    expect(event.status).toBe("LIVE");
  });
});

describe("destiny mapActiveMilestones", () => {
  it("maps a milestone to an event using its definition name", () => {
    const events = mapActiveMilestones(
      { "123": { milestoneHash: 123 } },
      { "123": { displayProperties: { name: "Weekly Raid" } } }
    );

    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Weekly Raid");
    expect(events[0].id).toBe("destiny-milestone-123");
  });

  it("drops milestones with no matching definition name", () => {
    const events = mapActiveMilestones(
      { "123": { milestoneHash: 123 }, "456": { milestoneHash: 456 } },
      { "123": { displayProperties: { name: "Weekly Raid" } } }
    );

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("destiny-milestone-123");
  });
});
