import { describe, expect, it } from "vitest";

import { mapGateStatus } from "./event-mapper";

describe("ffxiv mapGateStatus", () => {
  it("is LIVE when the gate is open (status 1)", () => {
    const [event] = mapGateStatus({ status: 1 });

    expect(event.status).toBe("LIVE");
    expect(event.id).toBe("ffxiv-platform-status");
  });

  it("is TRACKING when the gate is closed", () => {
    const [event] = mapGateStatus({ status: 0 });

    expect(event.status).toBe("TRACKING");
  });
});
