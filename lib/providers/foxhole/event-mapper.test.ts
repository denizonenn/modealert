import { describe, expect, it } from "vitest";

import { mapCurrentWar } from "./event-mapper";

import type { FoxholeWarState } from "./types";

const HOUR = 3_600_000;

function baseWar(overrides: Partial<FoxholeWarState> = {}): FoxholeWarState {
  return {
    warId: "war-1",
    warNumber: 137,
    winner: "NONE",
    conquestStartTime: Date.now() - HOUR,
    conquestEndTime: null,
    resistanceStartTime: null,
    scheduledConquestEndTime: Date.now() + 30 * 24 * HOUR,
    requiredVictoryTowns: 32,
    ...overrides,
  };
}

describe("foxhole mapCurrentWar", () => {
  it("is LIVE once conquest has started and no winner yet", () => {
    const [event] = mapCurrentWar(baseWar());

    expect(event.status).toBe("LIVE");
    expect(event.title).toBe("War #137");
    expect(event.id).toBe("foxhole-current-war");
  });

  it("is UPCOMING before conquestStartTime", () => {
    const [event] = mapCurrentWar(
      baseWar({ conquestStartTime: Date.now() + HOUR })
    );

    expect(event.status).toBe("UPCOMING");
  });

  it("is ENDED once a winner is declared", () => {
    const [event] = mapCurrentWar(baseWar({ winner: "COLONIALS" }));

    expect(event.status).toBe("ENDED");
  });

  it("is ENDED once conquestEndTime is set", () => {
    const [event] = mapCurrentWar(
      baseWar({ conquestEndTime: Date.now() - 1000 })
    );

    expect(event.status).toBe("ENDED");
  });

  it("is TRACKING during the resistance phase", () => {
    const [event] = mapCurrentWar(
      baseWar({ resistanceStartTime: Date.now() - 1000 })
    );

    expect(event.status).toBe("TRACKING");
  });
});
