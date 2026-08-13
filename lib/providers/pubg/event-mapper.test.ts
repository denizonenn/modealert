import { describe, expect, it } from "vitest";

import { mapCurrentSeason } from "./event-mapper";

describe("pubg mapCurrentSeason", () => {
  it("maps the season flagged isCurrentSeason, extracting the season number", () => {
    const events = mapCurrentSeason({
      data: [
        {
          id: "division.bro.official.pc-2018-42",
          attributes: { isCurrentSeason: true, isOffseason: false },
        },
        {
          id: "division.bro.official.pc-2018-41",
          attributes: { isCurrentSeason: false, isOffseason: false },
        },
      ],
    });

    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Season 42");
    expect(events[0].id).toBe(
      "pubg-season-division.bro.official.pc-2018-42"
    );
    expect(events[0].status).toBe("LIVE");
    expect(events[0].seriesKey).toBe("pubg-season");
  });

  it("returns no events when nothing is flagged as current", () => {
    const events = mapCurrentSeason({
      data: [
        {
          id: "division.bro.official.pc-2018-41",
          attributes: { isCurrentSeason: false, isOffseason: false },
        },
      ],
    });

    expect(events).toHaveLength(0);
  });

  it("falls back to the raw id if no trailing season number is found", () => {
    const events = mapCurrentSeason({
      data: [
        {
          id: "some-unusual-season-id",
          attributes: { isCurrentSeason: true, isOffseason: false },
        },
      ],
    });

    expect(events[0].title).toBe("some-unusual-season-id");
  });
});
