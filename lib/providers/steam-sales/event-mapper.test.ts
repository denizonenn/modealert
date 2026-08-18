import { describe, expect, it } from "vitest";

import { mapSteamSale } from "./event-mapper";

import type { SteamAppDetailsResponse } from "./types";

function priceResponse(
  appId: number,
  overrides: Partial<{
    success: boolean;
    discount_percent: number;
    initial: number;
    final: number;
  }> = {}
): SteamAppDetailsResponse {
  const {
    success = true,
    discount_percent = 0,
    initial = 1499,
    final = 1499,
  } = overrides;

  return {
    [String(appId)]: {
      success,
      data: {
        price_overview: {
          currency: "USD",
          initial,
          final,
          discount_percent,
        },
      },
    },
  };
}

describe("mapSteamSale", () => {
  it("is LIVE when discount_percent is above 0", () => {
    const response = priceResponse(505460, { discount_percent: 25 });
    const [event] = mapSteamSale("foxhole", "Foxhole", 505460, response);

    expect(event.status).toBe("LIVE");
    expect(event.title).toBe("Foxhole — Steam Sale");
    expect(event.id).toBe("steam-sale-505460");
  });

  it("is ENDED when discount_percent is 0", () => {
    const response = priceResponse(505460, { discount_percent: 0 });
    const [event] = mapSteamSale("foxhole", "Foxhole", 505460, response);

    expect(event.status).toBe("ENDED");
  });

  it("returns no event for a free-to-play game with no price_overview", () => {
    const response: SteamAppDetailsResponse = {
      "230410": { success: true, data: {} },
    };

    expect(mapSteamSale("warframe", "Warframe", 230410, response)).toEqual(
      []
    );
  });

  it("returns no event when the appid lookup fails entirely", () => {
    const response: SteamAppDetailsResponse = {
      "999999": { success: false },
    };

    expect(mapSteamSale("x", "X", 999999, response)).toEqual([]);
  });
});
