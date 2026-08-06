import { describe, expect, it } from "vitest";

import { mapCurrentLeague } from "./event-mapper";

import type { PoeLeague } from "./types";

const HOUR = 3_600_000;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function league(overrides: Partial<PoeLeague> = {}): PoeLeague {
  return {
    id: "Standard",
    realm: "pc",
    startAt: "2013-01-23T21:00:00Z",
    endAt: null,
    category: { id: "Standard" },
    ...overrides,
  };
}

describe("poe mapCurrentLeague", () => {
  it("picks the canonical softcore variant (id === category.id, category.current)", () => {
    const events = mapCurrentLeague([
      league({ id: "Standard" }),
      league({
        id: "Allflame",
        startAt: iso(-HOUR),
        category: { id: "Allflame", current: true },
      }),
      league({
        id: "Hardcore Allflame",
        startAt: iso(-HOUR),
        category: { id: "Allflame", current: true },
      }),
    ]);

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("poe-current-league");
    expect(events[0].title).toBe("Allflame League");
  });

  it("is LIVE once startAt has passed with no endAt", () => {
    const events = mapCurrentLeague([
      league({
        id: "Allflame",
        startAt: iso(-HOUR),
        endAt: null,
        category: { id: "Allflame", current: true },
      }),
    ]);

    expect(events[0].status).toBe("LIVE");
  });

  it("is UPCOMING before startAt", () => {
    const events = mapCurrentLeague([
      league({
        id: "Allflame",
        startAt: iso(HOUR),
        category: { id: "Allflame", current: true },
      }),
    ]);

    expect(events[0].status).toBe("UPCOMING");
  });

  it("is ENDED after endAt", () => {
    const events = mapCurrentLeague([
      league({
        id: "Allflame",
        startAt: iso(-2 * HOUR),
        endAt: iso(-HOUR),
        category: { id: "Allflame", current: true },
      }),
    ]);

    expect(events[0].status).toBe("ENDED");
  });

  it("returns nothing when no league matches the canonical pattern", () => {
    const events = mapCurrentLeague([
      league({ id: "Standard", category: { id: "Standard" } }),
      league({
        id: "Hardcore Allflame",
        category: { id: "Allflame", current: true },
      }),
    ]);

    expect(events).toHaveLength(0);
  });
});
