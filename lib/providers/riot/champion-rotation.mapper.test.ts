import { describe, expect, it } from "vitest";

import { mapChampionRotation } from "./champion-rotation.mapper";

describe("riot mapChampionRotation", () => {
  it("counts champions from the sr rotation in the title", () => {
    const [event] = mapChampionRotation({
      sr: [1, 2, 3, 4, 5, 6, 7],
      newplayer: [1, 2, 3],
    });

    expect(event.title).toBe("Champion Rotation (7 Champions)");
    expect(event.status).toBe("LIVE");
    expect(event.id).toBe("riot-champion-rotation");
    expect(event.gameId).toBe("lol");
  });
});
