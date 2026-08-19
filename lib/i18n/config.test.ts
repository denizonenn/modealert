import { describe, expect, it } from "vitest";

import { isLocale, resolveLocale, DEFAULT_LOCALE } from "./config";

describe("isLocale", () => {
  it("accepts supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("tr")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale("en-US")).toBe(false);
  });
});

describe("resolveLocale", () => {
  it("falls back to the default when there's no header", () => {
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("")).toBe(DEFAULT_LOCALE);
  });

  it("picks a supported locale from a simple header", () => {
    expect(resolveLocale("tr")).toBe("tr");
    expect(resolveLocale("en")).toBe("en");
  });

  it("matches a region-qualified tag to its base language", () => {
    expect(resolveLocale("tr-TR")).toBe("tr");
    expect(resolveLocale("en-GB")).toBe("en");
  });

  it("respects quality weighting, not header order", () => {
    // English listed first but explicitly lower priority.
    expect(resolveLocale("en;q=0.3,tr;q=0.9")).toBe("tr");
  });

  it("skips unsupported languages to find a supported one", () => {
    expect(resolveLocale("de-DE,fr;q=0.8,tr;q=0.5")).toBe("tr");
  });

  it("falls back to the default when nothing is supported", () => {
    expect(resolveLocale("de-DE,fr;q=0.8")).toBe(DEFAULT_LOCALE);
  });

  it("ignores entries explicitly rejected with q=0", () => {
    expect(resolveLocale("tr;q=0,en;q=0.5")).toBe("en");
  });

  it("handles a real browser header", () => {
    expect(
      resolveLocale("tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7")
    ).toBe("tr");
  });
});
