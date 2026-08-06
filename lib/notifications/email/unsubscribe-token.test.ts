import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config/env", () => ({
  env: { AUTH_SECRET: "test-secret" },
}));

const { createUnsubscribeToken, verifyUnsubscribeToken } = await import(
  "./unsubscribe-token"
);

describe("unsubscribe token", () => {
  it("produces a deterministic token for the same userId", () => {
    expect(createUnsubscribeToken("user-1")).toBe(
      createUnsubscribeToken("user-1")
    );
  });

  it("produces different tokens for different users", () => {
    expect(createUnsubscribeToken("user-1")).not.toBe(
      createUnsubscribeToken("user-2")
    );
  });

  it("verifies a token generated for the matching userId", () => {
    const token = createUnsubscribeToken("user-1");

    expect(verifyUnsubscribeToken("user-1", token)).toBe(true);
  });

  it("rejects a token generated for a different userId", () => {
    const token = createUnsubscribeToken("user-1");

    expect(verifyUnsubscribeToken("user-2", token)).toBe(false);
  });

  it("rejects a tampered/garbage token without throwing", () => {
    expect(verifyUnsubscribeToken("user-1", "not-a-real-token")).toBe(
      false
    );
  });

  it("rejects an empty token without throwing", () => {
    expect(verifyUnsubscribeToken("user-1", "")).toBe(false);
  });
});
