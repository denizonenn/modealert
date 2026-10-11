import { describe, expect, it } from "vitest";

import { buildBroadcastText, shouldBroadcast } from "./broadcast-text";

const LIVE_MODE = {
  status: "LIVE",
  category: "PLAYABLE",
  isLimitedTime: true,
} as const;

describe("shouldBroadcast", () => {
  it("posts when a limited-time playable mode goes live", () => {
    expect(shouldBroadcast(LIVE_MODE, { status: "ENDED" })).toBe(true);
    expect(shouldBroadcast(LIVE_MODE, { status: "UPCOMING" })).toBe(true);
  });

  it("posts for a brand-new event that arrives already live", () => {
    expect(shouldBroadcast(LIVE_MODE, null)).toBe(true);
  });

  it("does not repost something that was already live", () => {
    expect(shouldBroadcast(LIVE_MODE, { status: "LIVE" })).toBe(false);
  });

  it("ignores permanent modes, non-playable categories and non-LIVE states", () => {
    expect(
      shouldBroadcast({ ...LIVE_MODE, isLimitedTime: false }, null)
    ).toBe(false);
    expect(
      shouldBroadcast({ ...LIVE_MODE, category: "COSMETIC_SHOP" }, null)
    ).toBe(false);
    expect(
      shouldBroadcast({ ...LIVE_MODE, category: "PLATFORM_STATUS" }, null)
    ).toBe(false);
    expect(
      shouldBroadcast({ ...LIVE_MODE, status: "ENDED" }, { status: "LIVE" })
    ).toBe(false);
  });
});

describe("buildBroadcastText", () => {
  it("names the mode and game and adds a hashtag", () => {
    const text = buildBroadcastText("URF", "League of Legends");

    expect(text).toContain("URF is now live in League of Legends!");
    expect(text).toContain("#LeagueofLegends");
  });

  it("never contains a URL or bare domain (links cost ~13x more on X)", () => {
    const text = buildBroadcastText("Arena", "League of Legends");

    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toMatch(/modealert\.app/i);
  });

  it("skips hashtags that would be unreadably long", () => {
    const text = buildBroadcastText("Rivals", "EA Sports FC (Ultimate Team)");

    expect(text).not.toContain("#");
  });

  it("stays well under X's 280-character limit even for huge titles", () => {
    const text = buildBroadcastText("x".repeat(500), "League of Legends");

    expect(text.length).toBeLessThan(280);
    expect(text).toContain("…");
  });
});
