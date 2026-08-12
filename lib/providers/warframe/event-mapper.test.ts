import { describe, expect, it } from "vitest";

import { mapWarframeEvents } from "./event-mapper";

const HOUR = 3_600_000;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

describe("warframe mapWarframeEvents — Void Trader", () => {
  it("is LIVE while within the activation/expiry window", () => {
    const events = mapWarframeEvents({
      voidTrader: {
        id: "1",
        activation: iso(-HOUR),
        expiry: iso(HOUR),
        character: "Baro Ki'Teer",
        location: "Larunda Relay",
      },
    });

    const trader = events.find((e) => e.id === "warframe-void-trader");

    expect(trader?.status).toBe("LIVE");
    expect(trader?.title).toBe("Baro Ki'Teer at Larunda Relay");
  });

  it("is UPCOMING before activation", () => {
    const events = mapWarframeEvents({
      voidTrader: {
        id: "1",
        activation: iso(HOUR),
        expiry: iso(2 * HOUR),
        character: "Baro Ki'Teer",
        location: "Larunda Relay",
      },
    });

    const trader = events.find((e) => e.id === "warframe-void-trader");

    expect(trader?.status).toBe("UPCOMING");
    expect(trader?.title).toBe("Baro Ki'Teer arriving at Larunda Relay");
  });

  it("is omitted entirely when absent", () => {
    const events = mapWarframeEvents({});

    expect(events.find((e) => e.id === "warframe-void-trader")).toBeUndefined();
  });
});

describe("warframe mapWarframeEvents — Nightwave", () => {
  it("is LIVE when active", () => {
    const events = mapWarframeEvents({
      nightwave: { active: true, season: 12, tag: "Nightwave" },
    });

    const nightwave = events.find((e) => e.id === "warframe-nightwave");

    expect(nightwave?.status).toBe("LIVE");
    expect(nightwave?.title).toBe("Nightwave — Season 12");
  });

  it("is TRACKING when inactive (intermission)", () => {
    const events = mapWarframeEvents({
      nightwave: { active: false, season: 12, tag: "Nightwave" },
    });

    const nightwave = events.find((e) => e.id === "warframe-nightwave");

    expect(nightwave?.status).toBe("TRACKING");
  });

  it("is omitted entirely when null", () => {
    const events = mapWarframeEvents({ nightwave: null });

    expect(events.find((e) => e.id === "warframe-nightwave")).toBeUndefined();
  });
});

describe("warframe mapWarframeEvents — Sortie", () => {
  it("is LIVE when present and not expired", () => {
    const events = mapWarframeEvents({
      sortie: {
        id: "1",
        activation: iso(-HOUR),
        expiry: iso(HOUR),
        boss: "Kela De Thaym",
        expired: false,
      },
    });

    const sortie = events.find((e) => e.id === "warframe-sortie");

    expect(sortie?.status).toBe("LIVE");
    expect(sortie?.title).toBe("Sortie — Kela De Thaym");
  });

  it("is omitted when expired", () => {
    const events = mapWarframeEvents({
      sortie: {
        id: "1",
        activation: iso(-2 * HOUR),
        expiry: iso(-HOUR),
        boss: "Kela De Thaym",
        expired: true,
      },
    });

    expect(events.find((e) => e.id === "warframe-sortie")).toBeUndefined();
  });
});

describe("warframe mapWarframeEvents — Archon Hunt", () => {
  it("is LIVE when present", () => {
    const events = mapWarframeEvents({
      archonHunt: {
        id: "1",
        activation: iso(-HOUR),
        expiry: iso(HOUR),
        boss: "Archon Nira",
      },
    });

    const hunt = events.find((e) => e.id === "warframe-archon-hunt");

    expect(hunt?.status).toBe("LIVE");
    expect(hunt?.title).toBe("Archon Hunt — Archon Nira");
  });
});

describe("warframe mapWarframeEvents — Archimedea", () => {
  it("is LIVE when within the activation/expiry window", () => {
    const events = mapWarframeEvents({
      archimedeas: [
        {
          id: "1",
          activation: iso(-HOUR),
          expiry: iso(HOUR),
          type: "C T_ L A B",
        },
      ],
    });

    const archimedea = events.find((e) => e.id === "warframe-archimedea");

    expect(archimedea?.status).toBe("LIVE");
    expect(archimedea?.title).toBe("Deep Archimedea");
  });

  it("is ENDED outside the activation/expiry window", () => {
    const events = mapWarframeEvents({
      archimedeas: [
        {
          id: "1",
          activation: iso(-2 * HOUR),
          expiry: iso(-HOUR),
        },
      ],
    });

    const archimedea = events.find((e) => e.id === "warframe-archimedea");

    expect(archimedea?.status).toBe("ENDED");
  });

  it("is omitted entirely when absent", () => {
    const events = mapWarframeEvents({});

    expect(
      events.find((e) => e.id === "warframe-archimedea")
    ).toBeUndefined();
  });
});
