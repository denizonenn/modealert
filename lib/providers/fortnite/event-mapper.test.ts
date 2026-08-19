import { describe, expect, it } from "vitest";

import { mapItemShop } from "./event-mapper";

import type { FortniteShopEntry } from "./types";

function shopEntry(offerId: string): FortniteShopEntry {
  return {
    offerId,
    inDate: "2026-08-06T00:00:00.000Z",
    outDate: "2026-08-07T00:00:00.000Z",
  };
}

describe("fortnite mapItemShop", () => {
  it("includes the entry count in the title and is always LIVE", () => {
    const [event] = mapItemShop({
      hash: "abc",
      date: "2026-08-06T00:00:00.000Z",
      entries: [shopEntry("1"), shopEntry("2"), shopEntry("3")],
    });

    expect(event.title).toBe("Item Shop (3 items)");
    expect(event.status).toBe("LIVE");
    expect(event.id).toBe("fortnite-item-shop");
    expect(event.gameId).toBe("fortnite");
  });

  it("dedupes repeated item names in the description (real API returns the same name across multiple entries)", () => {
    const [event] = mapItemShop({
      hash: "abc",
      date: "2026-08-06T00:00:00.000Z",
      entries: [
        {
          ...shopEntry("1"),
          brItems: [{ name: "Frets of Chaos" }],
        },
        {
          ...shopEntry("2"),
          brItems: [{ name: "Frets of Chaos" }],
        },
        {
          ...shopEntry("3"),
          brItems: [{ name: "Tecca Bars" }],
        },
      ],
    });

    expect(event.description).toBe(
      "Featuring: Frets of Chaos, Tecca Bars."
    );
  });
});
