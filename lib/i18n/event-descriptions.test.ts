import { describe, expect, it } from "vitest";

import {
  renderEventDescription,
  resolveEventDescription,
} from "./event-descriptions";

describe("renderEventDescription", () => {
  it("renders a no-param key in both locales", () => {
    expect(renderEventDescription("pubg.seasonDescription", {}, "en")).toBe(
      "The current live PUBG ranked season, detected from PUBG's own live season data (`isCurrentSeason`) — not an announcement-date guess."
    );
    expect(renderEventDescription("pubg.seasonDescription", {}, "tr")).toBe(
      "PUBG'nin kendi canlı sezon verisinden (`isCurrentSeason`) tespit edilen, güncel canlı PUBG ranked sezonu — bir duyuru-tarihi tahmini değil."
    );
  });

  it("interpolates named params", () => {
    expect(
      renderEventDescription(
        "warframe.sortie",
        { boss: "Kela De Thaym" },
        "en"
      )
    ).toContain("Kela De Thaym");
    expect(
      renderEventDescription(
        "warframe.sortie",
        { boss: "Kela De Thaym" },
        "tr"
      )
    ).toContain("Kela De Thaym");
  });

  it("returns null for an unknown key", () => {
    expect(renderEventDescription("nonexistent.key", {}, "en")).toBeNull();
  });

  it("resolves the lol.queueStatus composite key from its base key", () => {
    const live = renderEventDescription(
      "lol.queueStatus",
      { baseKey: "lol.urf", liveRegionCount: 2, regions: "NA1, EUW1" },
      "en"
    );

    expect(live).toContain("Ultra Rapid Fire");
    expect(live).toContain("2 regions");
    expect(live).toContain("NA1, EUW1");

    const notLive = renderEventDescription(
      "lol.queueStatus",
      { baseKey: "lol.urf" },
      "en"
    );

    expect(notLive).toContain("Ultra Rapid Fire");
    expect(notLive).toContain("Not currently enabled");
  });
});

describe("resolveEventDescription", () => {
  it("prefers the translated render when descriptionKey is set", () => {
    const event = {
      description: "The current live PUBG ranked season fallback text.",
      descriptionKey: "pubg.seasonDescription",
      descriptionParams: {},
    };

    expect(resolveEventDescription(event, "tr")).toBe(
      "PUBG'nin kendi canlı sezon verisinden (`isCurrentSeason`) tespit edilen, güncel canlı PUBG ranked sezonu — bir duyuru-tarihi tahmini değil."
    );
  });

  it("falls back to the raw description when there's no descriptionKey (third-party text)", () => {
    const event = {
      description: "Beneath Venus, evil stirs…",
      descriptionKey: null,
      descriptionParams: null,
    };

    expect(resolveEventDescription(event, "tr")).toBe(
      "Beneath Venus, evil stirs…"
    );
  });

  it("falls back to the raw description when the key doesn't resolve", () => {
    const event = {
      description: "Raw fallback.",
      descriptionKey: "some.removed.key",
      descriptionParams: {},
    };

    expect(resolveEventDescription(event, "en")).toBe("Raw fallback.");
  });
});
