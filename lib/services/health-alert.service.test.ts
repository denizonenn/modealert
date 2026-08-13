import { describe, expect, it } from "vitest";

import { justCrossedIntoOutage } from "./health-alert.service";

describe("justCrossedIntoOutage", () => {
  it("is true the moment a provider fails 2 checks in a row for the first time", () => {
    expect(
      justCrossedIntoOutage([
        { healthy: false },
        { healthy: false },
        { healthy: true },
      ])
    ).toBe(true);
  });

  it("is true when there's no history before the 2 failures (brand new provider)", () => {
    expect(
      justCrossedIntoOutage([{ healthy: false }, { healthy: false }])
    ).toBe(true);
  });

  it("is false on the first failure alone (not yet 2 in a row)", () => {
    expect(
      justCrossedIntoOutage([{ healthy: false }, { healthy: true }])
    ).toBe(false);
  });

  it("is false once already alerted — the 3rd+ consecutive failure doesn't re-fire", () => {
    expect(
      justCrossedIntoOutage([
        { healthy: false },
        { healthy: false },
        { healthy: false },
      ])
    ).toBe(false);
  });

  it("is false when currently healthy", () => {
    expect(
      justCrossedIntoOutage([{ healthy: true }, { healthy: false }])
    ).toBe(false);
  });

  it("is false with no history at all", () => {
    expect(justCrossedIntoOutage([])).toBe(false);
  });
});
