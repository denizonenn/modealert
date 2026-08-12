import { describe, expect, it } from "vitest";

import { buildNotificationContent } from "./message-builder";

import type { ProviderEvent } from "@/lib/providers/core/provider";
import type { EventWithGame } from "@/lib/repositories/event.repository";

function event(
  overrides: Partial<ProviderEvent> = {}
): ProviderEvent {
  return {
    id: "event-1",
    gameId: "lol",
    title: "Arcane Anniversary",
    status: "LIVE",
    category: "PLAYABLE",
    trackedUsers: 0,
    checkedAt: new Date(),
    ...overrides,
  };
}

describe("buildNotificationContent", () => {
  it("announces a brand-new event when there is no previous state", () => {
    const content = buildNotificationContent(event(), null);

    expect(content.title).toBe("Arcane Anniversary is now LIVE");
    expect(content.message).toBe(
      "Arcane Anniversary just appeared with status LIVE."
    );
  });

  it("describes a status transition when a previous state exists", () => {
    const previous = {
      status: "UPCOMING",
    } as EventWithGame;

    const content = buildNotificationContent(
      event({ status: "LIVE" }),
      previous
    );

    expect(content.title).toBe("Arcane Anniversary is now LIVE");
    expect(content.message).toBe(
      "Arcane Anniversary changed from UPCOMING to LIVE."
    );
  });
});
