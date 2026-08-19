import { describe, expect, it } from "vitest";

import {
  summarizeSyncResults,
  type ProviderSyncOutcome,
} from "./provider-sync-summarize";

describe("summarizeSyncResults", () => {
  it("passes through fulfilled outcomes unchanged", () => {
    const results: PromiseSettledResult<ProviderSyncOutcome>[] = [
      {
        status: "fulfilled",
        value: { provider: "riot", received: 5, saved: 3 },
      },
      {
        status: "fulfilled",
        value: { provider: "fortnite", skipped: true },
      },
    ];

    expect(summarizeSyncResults(["riot", "fortnite"], results)).toEqual([
      { provider: "riot", received: 5, saved: 3 },
      { provider: "fortnite", skipped: true },
    ]);
  });

  it("maps a rejected Error reason to its message", () => {
    const results: PromiseSettledResult<ProviderSyncOutcome>[] = [
      {
        status: "rejected",
        reason: new Error("timeout after 10s"),
      },
    ];

    expect(summarizeSyncResults(["warframe"], results)).toEqual([
      { provider: "warframe", error: "timeout after 10s" },
    ]);
  });

  it("falls back to a generic message for a non-Error rejection reason", () => {
    const results: PromiseSettledResult<ProviderSyncOutcome>[] = [
      {
        status: "rejected",
        reason: "raw string rejection",
      },
    ];

    expect(summarizeSyncResults(["poe"], results)).toEqual([
      { provider: "poe", error: "Unknown error" },
    ]);
  });

  it("matches each result to its provider by index, not by identity", () => {
    const results: PromiseSettledResult<ProviderSyncOutcome>[] = [
      { status: "fulfilled", value: { provider: "a", received: 1, saved: 1 } },
      { status: "rejected", reason: new Error("boom") },
      { status: "fulfilled", value: { provider: "c", skipped: true } },
    ];

    const summary = summarizeSyncResults(["a", "b", "c"], results);

    expect(summary[1]).toEqual({ provider: "b", error: "boom" });
  });
});
