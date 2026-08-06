import { describe, expect, it } from "vitest";

import {
  mapActiveActs,
  mapPlatformStatus,
  mapValorantEvents,
} from "./event-mapper";

describe("valorant mapPlatformStatus", () => {
  it("is LIVE with no maintenances", () => {
    const [event] = mapPlatformStatus({ id: "na", maintenances: [] });

    expect(event.status).toBe("LIVE");
    expect(event.gameId).toBe("valorant");
  });

  it("is TRACKING with maintenances present", () => {
    const [event] = mapPlatformStatus({
      id: "na",
      maintenances: [{ id: 1 }],
    });

    expect(event.status).toBe("TRACKING");
  });
});

describe("valorant mapActiveActs", () => {
  it("only includes acts where isActive is true", () => {
    const events = mapActiveActs({
      acts: [
        {
          id: "act-1",
          parentId: "ep-1",
          type: "act",
          name: "Episode 1 Act 1",
          isActive: false,
        },
        {
          id: "act-2",
          parentId: "ep-1",
          type: "act",
          name: "Episode 1 Act 2",
          isActive: true,
        },
      ],
    });

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("valorant-act-act-2");
    expect(events[0].status).toBe("LIVE");
  });

  it("prefers the en-US localized name when available", () => {
    const events = mapActiveActs({
      acts: [
        {
          id: "act-1",
          parentId: "ep-1",
          type: "act",
          name: "Fallback Name",
          isActive: true,
          localizedNames: { "en-US": "Localized Name" },
        },
      ],
    });

    expect(events[0].title).toBe("Localized Name");
  });

  it("falls back to the raw name when no localized name exists", () => {
    const events = mapActiveActs({
      acts: [
        {
          id: "act-1",
          parentId: "ep-1",
          type: "act",
          name: "Fallback Name",
          isActive: true,
        },
      ],
    });

    expect(events[0].title).toBe("Fallback Name");
  });
});

describe("mapValorantEvents", () => {
  it("combines platform status and active acts", () => {
    const events = mapValorantEvents(
      { id: "na", maintenances: [], incidents: [] },
      {
        acts: [
          {
            id: "act-1",
            parentId: "ep-1",
            type: "act",
            name: "Act 1",
            isActive: true,
          },
        ],
      }
    );

    expect(events).toHaveLength(2);
    expect(events[0].id).toBe("valorant-platform-na");
    expect(events[1].id).toBe("valorant-act-act-1");
  });
});
