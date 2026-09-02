import { describe, expect, it } from "vitest";

import { buildDigestHtml } from "./digest-template";

const UNSUBSCRIBE_URL =
  "https://modealert.vercel.app/api/unsubscribe?userId=1&token=abc";

const FEEDBACK_URLS = {
  useful:
    "https://modealert.vercel.app/api/digest-feedback?userId=1&token=abc&useful=1",
  notUseful:
    "https://modealert.vercel.app/api/digest-feedback?userId=1&token=abc&useful=0",
};

// The recipient's own translated copy, resolved by
// weekly-digest.service.ts — English here so assertions stay
// readable; a tr case is covered separately below.
const EN_LABELS = {
  eyebrow: "Weekly Digest",
  title: "Your watchlist this week",
  intro:
    "Real-time alerts still fire the moment something changes — this is just the current status of everything you're tracking, in one place.",
  usefulQuestion: "Was this digest useful?",
  yes: "Yes",
  no: "No",
  footer: "You're getting this because you're tracking at least one event.",
  unsubscribe: "Unsubscribe",
};

describe("buildDigestHtml", () => {
  it("renders every tracked event with its game and status", () => {
    const html = buildDigestHtml(
      [
        { title: "Set 18", gameName: "Teamfight Tactics", status: "LIVE" },
        { title: "War #139", gameName: "Foxhole", status: "ENDED" },
      ],
      UNSUBSCRIBE_URL,
      FEEDBACK_URLS,
      EN_LABELS
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
      UNSUBSCRIBE_URL,
      FEEDBACK_URLS,
      EN_LABELS
    );

    expect(html).toContain(
      'href="https://modealert.vercel.app/events/tft-set-18-abc123"'
    );
  });

  it("falls back to plain text when an entry has no URL", () => {
    const html = buildDigestHtml(
      [{ title: "Set 18", gameName: "Teamfight Tactics", status: "LIVE" }],
      UNSUBSCRIBE_URL,
      FEEDBACK_URLS,
      EN_LABELS
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
      UNSUBSCRIBE_URL,
      FEEDBACK_URLS,
      EN_LABELS
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
      UNSUBSCRIBE_URL,
      FEEDBACK_URLS,
      EN_LABELS
    );

    expect(html).not.toContain('"><script>alert(1)</script>');
  });

  it("includes both feedback links", () => {
    const html = buildDigestHtml(
      [{ title: "Set 18", gameName: "Teamfight Tactics", status: "LIVE" }],
      UNSUBSCRIBE_URL,
      FEEDBACK_URLS,
      EN_LABELS
    );

    expect(html).toContain(
      `href="${FEEDBACK_URLS.useful.replace(/&/g, "&amp;")}"`
    );
    expect(html).toContain(
      `href="${FEEDBACK_URLS.notUseful.replace(/&/g, "&amp;")}"`
    );
  });

  it("renders the caller's translated labels rather than hardcoded English", () => {
    const html = buildDigestHtml(
      [{ title: "Set 18", gameName: "Teamfight Tactics", status: "LIVE" }],
      UNSUBSCRIBE_URL,
      FEEDBACK_URLS,
      {
        eyebrow: "Haftalık Özet",
        title: "Bu hafta watchlist'in",
        intro: "Anlık uyarılar bir şey değiştiği an gelmeye devam ediyor.",
        usefulQuestion: "Bu özet işine yaradı mı?",
        yes: "Evet",
        no: "Hayır",
        footer: "Bunu, en az bir etkinliği takip ettiğin için alıyorsun.",
        unsubscribe: "Abonelikten çık",
      }
    );

    expect(html).toContain("Haftalık Özet");
    expect(html).toContain("Bu hafta watchlist&#39;in");
    expect(html).toContain("Bu özet işine yaradı mı?");
    expect(html).toContain(">Evet<");
    expect(html).toContain(">Hayır<");
    expect(html).toContain("Abonelikten çık");
    expect(html).not.toContain("Weekly Digest");
    expect(html).not.toContain("Was this digest useful?");
  });
});
