import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config/env", () => ({
  env: {
    ADMIN_EMAILS: "Denizate@gmail.com, second@example.com",
  },
}));

const { isAdminEmail } = await import("./is-admin");

describe("isAdminEmail", () => {
  it("matches case-insensitively", () => {
    expect(isAdminEmail("denizate@gmail.com")).toBe(true);
    expect(isAdminEmail("DENIZATE@GMAIL.COM")).toBe(true);
  });

  it("matches any email in the comma-separated list", () => {
    expect(isAdminEmail("second@example.com")).toBe(true);
  });

  it("rejects unknown emails", () => {
    expect(isAdminEmail("random@example.com")).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
