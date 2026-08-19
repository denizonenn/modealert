import { describe, expect, it } from "vitest";

import { mapCurrentAlert } from "./event-mapper";

const DEFINITIONS = {
  metagame_event_list: [
    {
      metagame_event_id: "1",
      name: { en: "Feeling the Heat" },
      duration_minutes: "90",
    },
  ],
};

const ZONES = {
  zone_list: [{ zone_id: "2", name: { en: "Indar" } }],
};

describe("planetside2 mapCurrentAlert", () => {
  it("is LIVE when the most recent transition is 'started', with an estimated end", () => {
    const [event] = mapCurrentAlert(
      {
        world_event_list: [
          {
            metagame_event_id: "1",
            metagame_event_state_name: "started",
            timestamp: "1786608270",
            zone_id: "2",
            instance_id: "48833",
          },
        ],
      },
      DEFINITIONS,
      ZONES
    );

    expect(event.status).toBe("LIVE");
    expect(event.id).toBe("planetside2-alert");
    expect(event.description).toContain("Feeling the Heat");
    expect(event.description).toContain("Indar");
    expect(event.description).toContain("expected to end around");
  });

  it("is ENDED when the most recent transition is 'ended', with no next-time claim", () => {
    const [event] = mapCurrentAlert(
      {
        world_event_list: [
          {
            metagame_event_id: "1",
            metagame_event_state_name: "ended",
            timestamp: "1786610972",
            zone_id: "2",
            instance_id: "48833",
          },
        ],
      },
      DEFINITIONS,
      ZONES
    );

    expect(event.status).toBe("ENDED");
    expect(event.description).not.toContain("expected");
    expect(event.description).toContain(
      "No territory-control Alert currently active"
    );
  });

  it("returns no events when there's no history at all", () => {
    const events = mapCurrentAlert(
      { world_event_list: [] },
      DEFINITIONS,
      ZONES
    );

    expect(events).toHaveLength(0);
  });

  it("falls back to a generic label when the definition/zone lookup misses", () => {
    const [event] = mapCurrentAlert(
      {
        world_event_list: [
          {
            metagame_event_id: "999",
            metagame_event_state_name: "started",
            timestamp: "1786608270",
            zone_id: "999",
            instance_id: "1",
          },
        ],
      },
      DEFINITIONS,
      ZONES
    );

    expect(event.description).toContain("Alert 999");
    expect(event.description).toContain("Zone 999");
  });
});
