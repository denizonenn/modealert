import { describe, expect, it } from "vitest";

import {
  mapActiveMilestones,
  mapIronBanner,
  mapPlatformStatus,
  mapXur,
} from "./event-mapper";

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

describe("destiny mapIronBanner", () => {
  it("is LIVE during the announced window (June 30, 2026 + every 4 weeks, 7-day window)", () => {
    const [event] = mapIronBanner(new Date("2026-06-30T12:00:00.000Z"));

    expect(event.status).toBe("LIVE");
    expect(event.id).toBe("destiny-iron-banner");
    expect(event.gameId).toBe("destiny");
  });

  it("is LIVE on the last day of the 7-day window", () => {
    const [event] = mapIronBanner(new Date("2026-07-07T00:00:00.000Z"));

    expect(event.status).toBe("LIVE");
  });

  it("is ENDED between windows, with the next expected date in the description", () => {
    const [event] = mapIronBanner(new Date("2026-07-15T00:00:00.000Z"));

    expect(event.status).toBe("ENDED");
    expect(event.description).toContain("Next expected");
  });

  it("is LIVE again on the next 4-week cycle (July 28, 2026)", () => {
    const [event] = mapIronBanner(new Date("2026-07-28T12:00:00.000Z"));

    expect(event.status).toBe("LIVE");
  });

  it("is LIVE on the cycle after that too (August 25, 2026)", () => {
    const [event] = mapIronBanner(new Date("2026-08-25T12:00:00.000Z"));

    expect(event.status).toBe("LIVE");
  });
});

describe("destiny mapXur (Friday 17:00 UTC – Tuesday 17:00 UTC weekly)", () => {
  it("is LIVE just after Friday's arrival", () => {
    const [event] = mapXur(new Date("2026-08-14T20:00:00.000Z"));

    expect(event.status).toBe("LIVE");
    expect(event.id).toBe("destiny-xur");
    expect(event.gameId).toBe("destiny");
  });

  it("is ENDED on Friday before the 17:00 UTC arrival", () => {
    const [event] = mapXur(new Date("2026-08-14T10:00:00.000Z"));

    expect(event.status).toBe("ENDED");
  });

  it("is LIVE on Tuesday before the 17:00 UTC departure", () => {
    const [event] = mapXur(new Date("2026-08-18T10:00:00.000Z"));

    expect(event.status).toBe("LIVE");
  });

  it("is ENDED on Tuesday after the 17:00 UTC departure", () => {
    const [event] = mapXur(new Date("2026-08-18T20:00:00.000Z"));

    expect(event.status).toBe("ENDED");
  });

  it("reports the next Friday arrival when away mid-week", () => {
    const [event] = mapXur(new Date("2026-08-19T12:00:00.000Z"));

    expect(event.status).toBe("ENDED");
    expect(event.description).toContain("21 Aug 2026");
  });
});
