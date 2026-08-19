import { describe, expect, it } from "vitest";

import { buildDigestHtml } from "./digest-template";

const UNSUBSCRIBE_URL =
  "https://modealert.vercel.app/api/unsubscribe?userId=1&token=abc";

describe("buildDigestHtml", () => {
  it("renders every tracked event with its game and status", () => {
    const html = buildDigestHtml(
      [
        { title: "Set 18", gameName: "Teamfight Tactics", status: "LIVE" },
        { title: "War #139", gameName: "Foxhole", status: "ENDED" },
      ],
      UNSUBSCRIBE_URL
    );

    expect(html).toContain("Set 18");
    expect(html).toContain("Teamfight Tactics");
    expect(html).toContain("War #139");
    expect(html).toContain("Foxhole");
  });

  it("links an entry's title when the event has a URL", () => {
    const html = buildDigestHtml(
      [
        {
          title: "Set 18",
          gameName: "Teamfight Tactics",
          status: "LIVE",
          url: "https://modealert.vercel.app/events/tft-set-18-abc123",
        },
      ],
      UNSUBSCRIBE_URL
    );

    expect(html).toContain(
      'href="https://modealert.vercel.app/events/tft-set-18-abc123"'
    );
  });

  it("falls back to plain text when an entry has no URL", () => {
    const html = buildDigestHtml(
      [{ title: "Set 18", gameName: "Teamfight Tactics", status: "LIVE" }],
      UNSUBSCRIBE_URL
    );

    expect(html).toContain("Set 18");
    expect(html).not.toContain("/events/");
  });

  it("escapes HTML in provider-supplied titles instead of injecting it raw", () => {
    const html = buildDigestHtml(
      [
        {
          title: "<script>alert(1)</script>",
          gameName: "<img src=x onerror=alert(1)>",
          status: "LIVE",
        },
      ],
      UNSUBSCRIBE_URL
    );

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("escapes the URL too, so a malformed slug can't break out of the href", () => {
    const html = buildDigestHtml(
      [
        {
          title: "Set 18",
          gameName: "Teamfight Tactics",
          status: "LIVE",
          url: 'https://modealert.vercel.app/events/"><script>alert(1)</script>',
        },
      ],
      UNSUBSCRIBE_URL
    );

    expect(html).not.toContain('"><script>alert(1)</script>');
  });
});
