import { describe, expect, it } from "vitest";

import { buildNotificationContent } from "./message-builder";

import en from "@/lib/i18n/dictionaries/en.json";
import trJson from "@/lib/i18n/dictionaries/tr.json";

import type { ProviderEvent } from "@/lib/providers/core/provider";
import type { EventWithGame } from "@/lib/repositories/event.repository";
import type { Dictionary } from "@/lib/i18n/load-dictionary";

const EN: Dictionary = en;
const TR = trJson as Dictionary;

function event(
  overrides: Partial<ProviderEvent> = {}
): ProviderEvent {
  return {
    id: "event-1",
    gameId: "lol",
    title: "Arcane Anniversary",
    status: "LIVE",
    category: "PLAYABLE",
    isLimitedTime: true,
    trackedUsers: 0,
    checkedAt: new Date(),
    ...overrides,
  };
}

describe("buildNotificationContent", () => {
  it("announces a brand-new event when there is no previous state", () => {
    const content = buildNotificationContent(event(), null, EN);

    expect(content.title).toBe(
      "League of Legends: Arcane Anniversary is live now"
    );
    expect(content.message).toBe(
      "Arcane Anniversary (League of Legends) is now being tracked — currently live."
    );
  });

  it("describes a status transition when a previous state exists", () => {
    const previous = {
      status: "UPCOMING",
    } as EventWithGame;

    const content = buildNotificationContent(
      event({ status: "LIVE" }),
      previous,
      EN
    );

    expect(content.title).toBe(
      "League of Legends: Arcane Anniversary is live now"
    );
    expect(content.message).toBe(
      "Arcane Anniversary (League of Legends) went from upcoming to live."
    );
  });

  it("names the game so a multi-game user knows which one it is", () => {
    const content = buildNotificationContent(
      event({ gameId: "valorant", title: "ACT V", status: "ENDED" }),
      null,
      EN
    );

    expect(content.title).toBe("Valorant: ACT V has ended");
  });

  it("prefers the real game name off the previous row over the id lookup", () => {
    const previous = {
      status: "LIVE",
      game: { name: "EA Sports FC (Ultimate Team)" },
    } as EventWithGame;

    const content = buildNotificationContent(
      event({ gameId: "ea-fc", title: "Squad Building Challenges", status: "ENDED" }),
      previous,
      EN
    );

    expect(content.title).toBe(
      "EA Sports FC (Ultimate Team): Squad Building Challenges has ended"
    );
  });

  it("falls back to the raw gameId for a game with no mapped name", () => {
    const content = buildNotificationContent(
      event({ gameId: "brand-new-game", title: "Some Event" }),
      null,
      EN
    );

    expect(content.title).toBe("brand-new-game: Some Event is live now");
  });

  it("translates every status into readable copy, not a raw code", () => {
    const statuses: Array<[ProviderEvent["status"], string]> = [
      ["LIVE", "is live now"],
      ["UPCOMING", "is coming up"],
      ["TRACKING", "is winding down"],
      ["ENDED", "has ended"],
    ];

    for (const [status, expected] of statuses) {
      const content = buildNotificationContent(event({ status }), null, EN);

      expect(content.title).toBe(
        `League of Legends: Arcane Anniversary ${expected}`
      );
    }
  });

  it("builds the same notification in the recipient's own language", () => {
    const previous = {
      status: "UPCOMING",
    } as EventWithGame;

    const content = buildNotificationContent(
      event({ status: "LIVE" }),
      previous,
      TR
    );

    // Game and event names are real proper nouns — untranslated by
    // design; only the surrounding copy changes.
    expect(content.title).toBe(
      "League of Legends: Arcane Anniversary şu an canlı"
    );
    expect(content.message).toBe(
      "Arcane Anniversary (League of Legends) yaklaşan durumundan canlı durumuna geçti."
    );
  });

  it("translates a brand-new event announcement too", () => {
    const content = buildNotificationContent(event(), null, TR);

    expect(content.message).toBe(
      "Arcane Anniversary (League of Legends) artık takip ediliyor — şu an canlı."
    );
  });
});
