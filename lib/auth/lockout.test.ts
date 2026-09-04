import { describe, expect, it } from "vitest";

import { isLockedOut, nextLockedUntil } from "./lockout";

describe("isLockedOut", () => {
  it("is false when lockedUntil is null", () => {
    expect(isLockedOut(null)).toBe(false);
  });

  it("is true when lockedUntil is in the future", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const lockedUntil = new Date("2026-01-01T00:10:00Z");

    expect(isLockedOut(lockedUntil, now)).toBe(true);
  });

  it("is false once lockedUntil has passed", () => {
    const now = new Date("2026-01-01T00:20:00Z");
    const lockedUntil = new Date("2026-01-01T00:10:00Z");

    expect(isLockedOut(lockedUntil, now)).toBe(false);
  });

  it("is false at the exact expiry instant (strictly-after, not at-or-after)", () => {
    const at = new Date("2026-01-01T00:10:00Z");

    expect(isLockedOut(at, at)).toBe(false);
  });
});

describe("nextLockedUntil", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("returns null below the threshold", () => {
    expect(nextLockedUntil(4, 5, 15 * 60 * 1000, now)).toBeNull();
  });

  it("locks exactly at the threshold", () => {
    const result = nextLockedUntil(5, 5, 15 * 60 * 1000, now);

    expect(result).toEqual(new Date("2026-01-01T00:15:00Z"));
  });

  it("locks above the threshold too (a burst of concurrent failures can overshoot it)", () => {
    const result = nextLockedUntil(7, 5, 15 * 60 * 1000, now);

    expect(result).toEqual(new Date("2026-01-01T00:15:00Z"));
  });

  it("uses the given duration to compute the lock expiry", () => {
    const result = nextLockedUntil(5, 5, 60 * 60 * 1000, now);

    expect(result).toEqual(new Date("2026-01-01T01:00:00Z"));
  });
});
