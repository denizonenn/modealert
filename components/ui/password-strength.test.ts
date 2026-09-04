import { describe, expect, it } from "vitest";

import { computePasswordStrength, defaultPasswordRules } from "./password-strength";

describe("computePasswordStrength", () => {
  it("scores an empty password as 0 with no announcement", () => {
    const result = computePasswordStrength("");

    expect(result.score).toBe(0);
    expect(result.announcement).toBe("");
    expect(result.guessable).toBe(false);
  });

  it("scores a password meeting every rule at the max", () => {
    const result = computePasswordStrength("Correct-Horse-99");

    expect(result.score).toBe(result.max);
    expect(result.rules.every((r) => r.met)).toBe(true);
    expect(result.label).toBe("Strong");
  });

  it("scores a password meeting only the length rule at 1", () => {
    const result = computePasswordStrength("aaaaaaaaaaaa");

    // 12+ chars (length rule met), but no upper/digit/symbol — and it
    // trips the 4-repeat RUN pattern, which forces guessable=true and
    // caps the score at 1 regardless of how many rules technically
    // pass. This is the real security behavior worth pinning: a
    // long password isn't automatically a strong one.
    expect(result.guessable).toBe(true);
    expect(result.score).toBe(1);
  });

  it("flags a known common password as guessable even if it meets length", () => {
    const result = computePasswordStrength("password123456");

    expect(result.guessable).toBe(true);
    expect(result.score).toBe(1);
    expect(result.label).toBe("Weak");
  });

  it("flags a keyboard-run pattern as guessable", () => {
    const result = computePasswordStrength("qwertyuiop12");

    expect(result.guessable).toBe(true);
  });

  it("flags 4+ repeated characters as guessable", () => {
    const result = computePasswordStrength("Ab1!aaaacd");

    expect(result.guessable).toBe(true);
  });

  it("does not flag a normal password as guessable", () => {
    const result = computePasswordStrength("Tr0ub4dor&3xyz");

    expect(result.guessable).toBe(false);
  });

  it("never scores above the rule count even if somehow more rules pass than exist", () => {
    const result = computePasswordStrength("Aa1!Aa1!Aa1!");

    expect(result.score).toBeLessThanOrEqual(defaultPasswordRules.length);
  });

  it("gives a non-empty, non-guessable password at least a score of 1", () => {
    const result = computePasswordStrength("x");

    expect(result.score).toBeGreaterThanOrEqual(1);
  });

  it("lists exactly the unmet rules in the announcement, lowercased", () => {
    const result = computePasswordStrength("alllowercase12");

    // digit rule is met (has "1"/"2"), so "a number" must not appear —
    // only the two genuinely unmet rules should be listed.
    expect(result.announcement).toContain("upper and lower case");
    expect(result.announcement).toContain("a symbol");
    expect(result.announcement).not.toContain("a number");
  });

  it("announces all requirements met when every rule passes", () => {
    const result = computePasswordStrength("Correct-Horse-99");

    expect(result.announcement).toContain("All requirements met.");
  });

  it("clamps the displayed label to the last one when score would exceed the label list", () => {
    const result = computePasswordStrength("Correct-Horse-99!!", defaultPasswordRules, [
      "Empty",
      "Weak",
    ]);

    expect(result.label).toBe("Weak");
  });
});
