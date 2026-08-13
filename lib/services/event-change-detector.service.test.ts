import { describe, expect, it } from "vitest";

import { diffEventFields } from "./event-change-detector.service";

function event(overrides: Partial<{
  title: string;
  description: string | null;
  status: string;
  category: string;
  isLimitedTime: boolean;
}> = {}) {
  return {
    title: "Mayhem Set 2",
    description: "A rotating mode.",
    status: "LIVE",
    category: "PLAYABLE",
    isLimitedTime: true,
    ...overrides,
  };
}

describe("diffEventFields", () => {
  it("returns no changes when nothing differs", () => {
    expect(diffEventFields(event(), event())).toEqual([]);
  });

  it("detects a title change", () => {
    const changes = diffEventFields(
      event({ title: "Mayhem Set 2" }),
      event({ title: "Mayhem Set 3" })
    );

    expect(changes).toEqual([
      { field: "title", oldValue: "Mayhem Set 2", newValue: "Mayhem Set 3" },
    ]);
  });

  it("detects a status change", () => {
    const changes = diffEventFields(
      event({ status: "LIVE" }),
      event({ status: "ENDED" })
    );

    expect(changes).toEqual([
      { field: "status", oldValue: "LIVE", newValue: "ENDED" },
    ]);
  });

  it("detects multiple simultaneous field changes in one pass", () => {
    const changes = diffEventFields(
      event({ title: "Old Title", status: "LIVE" }),
      event({ title: "New Title", status: "ENDED" })
    );

    expect(changes.map((c) => c.field).sort()).toEqual(["status", "title"]);
  });

  it("treats null and undefined description as equal (no false-positive change)", () => {
    const changes = diffEventFields(
      event({ description: null }),
      event({ description: undefined })
    );

    expect(changes).toEqual([]);
  });

  it("detects description going from set to cleared", () => {
    const changes = diffEventFields(
      event({ description: "Something real." }),
      event({ description: undefined })
    );

    expect(changes).toEqual([
      {
        field: "description",
        oldValue: "Something real.",
        newValue: null,
      },
    ]);
  });

  it("stringifies boolean isLimitedTime changes correctly", () => {
    const changes = diffEventFields(
      event({ isLimitedTime: true }),
      event({ isLimitedTime: false })
    );

    expect(changes).toEqual([
      { field: "isLimitedTime", oldValue: "true", newValue: "false" },
    ]);
  });
});
