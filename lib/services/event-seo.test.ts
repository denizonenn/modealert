import { describe, expect, it } from "vitest";

import {
  buildEventSeo,
  humanDuration,
  isSearchIntentEvent,
  type SeoTemplates,
} from "./event-seo";

const T: SeoTemplates = {
  seoTitle: "Is {title} live? — {game}",
  seoDescLive: "{title} is live{since}.{avg}",
  seoDescNotLive: "{title} not live. Last {start} – {end} ({duration}).",
  seoDescNoHistory: "{title} not live, no history.",
  seoAvgFragment: " Lasts ~{duration}.",
  seoSinceFragment: " since {since}",
  answerLive: "Yes{since}.",
  answerNotLive: "No. Last {start} – {end} ({duration}).",
  answerNoHistory: "No.",
};

const URF = {
  title: "URF",
  gameName: "League of Legends",
  category: "PLAYABLE",
  isLimitedTime: true,
};

const day = (d: number) => new Date(Date.UTC(2026, 7, d));

describe("isSearchIntentEvent", () => {
  it("is true only for limited-time playable modes", () => {
    expect(isSearchIntentEvent({ category: "PLAYABLE", isLimitedTime: true })).toBe(true);
    expect(isSearchIntentEvent({ category: "PLAYABLE", isLimitedTime: false })).toBe(false);
    expect(isSearchIntentEvent({ category: "SEASON_PASS", isLimitedTime: true })).toBe(false);
  });
});

describe("humanDuration", () => {
  it("uses days once a day or more, singular vs plural", () => {
    expect(humanDuration(6 * 86_400_000, "en")).toBe("6 days");
    expect(humanDuration(86_400_000, "en")).toBe("1 day");
    expect(humanDuration(6 * 86_400_000, "tr")).toBe("6 gün");
  });

  it("falls back to hours under a day, never zero", () => {
    expect(humanDuration(3 * 3_600_000, "en")).toBe("3 hours");
    expect(humanDuration(60_000, "en")).toBe("1 hour");
  });
});

describe("buildEventSeo", () => {
  it("answers 'not live' with the real last window", () => {
    const seo = buildEventSeo(
      { ...URF, status: "ENDED" },
      [{ startedAt: day(13), endedAt: day(19) }],
      T,
      "en"
    );

    expect(seo.title).toBe("Is URF live? — League of Legends");
    expect(seo.description).toBe(
      "URF not live. Last Aug 13, 2026 – Aug 19, 2026 (6 days)."
    );
    expect(seo.answer).toBe("No. Last Aug 13, 2026 – Aug 19, 2026 (6 days).");
  });

  it("answers 'live' with the current window's start and the average of past windows", () => {
    const seo = buildEventSeo(
      { ...URF, status: "LIVE" },
      [
        { startedAt: day(1), endedAt: day(5) },
        { startedAt: day(20), endedAt: null },
      ],
      T,
      "en"
    );

    expect(seo.description).toBe("URF is live since Aug 20, 2026. Lasts ~4 days.");
    expect(seo.answer).toBe("Yes since Aug 20, 2026.");
  });

  it("omits the 'since' and average fragments when there's no data for them", () => {
    const seo = buildEventSeo({ ...URF, status: "LIVE" }, [], T, "en");

    expect(seo.description).toBe("URF is live.");
    expect(seo.answer).toBe("Yes.");
  });

  it("uses the no-history copy for a mode never seen live", () => {
    const seo = buildEventSeo({ ...URF, status: "UPCOMING" }, [], T, "en");

    expect(seo.description).toBe("URF not live, no history.");
    expect(seo.answer).toBe("No.");
  });

  it("ignores a still-open window when a non-LIVE event reports its last span", () => {
    const seo = buildEventSeo(
      { ...URF, status: "TRACKING" },
      [
        { startedAt: day(1), endedAt: day(3) },
        { startedAt: day(10), endedAt: null },
      ],
      T,
      "en"
    );

    expect(seo.answer).toBe("No. Last Aug 1, 2026 – Aug 3, 2026 (2 days).");
  });
});
