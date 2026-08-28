import { describe, expect, it } from "vitest";

import { buildEmailHtml, buildWelcomeEmailHtml } from "./template";

const UNSUBSCRIBE_URL =
  "https://modealert.vercel.app/api/unsubscribe?userId=1&token=abc";

// The four label arguments are the recipient's own translated copy,
// resolved by email.provider.ts. English here so the assertions stay
// readable; a tr case is covered separately below.
const EN_LABELS = [
  "View event",
  "Unsubscribe",
  "Event Update",
  "You're getting this email because an event on your watchlist was updated.",
] as const;

describe("buildEmailHtml", () => {
  it("embeds title, message, and unsubscribe URL", () => {
    const html = buildEmailHtml(
      "Arcane Anniversary is now LIVE",
      "Arcane Anniversary just appeared with status LIVE.",
      UNSUBSCRIBE_URL,
      undefined,
      ...EN_LABELS
    );

    expect(html).toContain("Arcane Anniversary is now LIVE");
    expect(html).toContain(
      "Arcane Anniversary just appeared with status LIVE."
    );
    expect(html).toContain(
      "https://modealert.vercel.app/api/unsubscribe?userId=1&amp;token=abc"
    );
  });

  it("renders a View event CTA when an event URL is available", () => {
    const html = buildEmailHtml(
      "Valorant: ACT V has ended",
      "ACT V (Valorant) went from live to ended.",
      UNSUBSCRIBE_URL,
      "https://modealert.vercel.app/en/events/valorant-act-v-abc123",
      ...EN_LABELS
    );

    expect(html).toContain("View event");
    expect(html).toContain(
      "https://modealert.vercel.app/en/events/valorant-act-v-abc123"
    );
  });

  it("omits the CTA entirely when there is no event URL (brand-new event, no slug yet)", () => {
    const html = buildEmailHtml(
      "Valorant: ACT V has ended",
      "ACT V (Valorant) went from live to ended.",
      UNSUBSCRIBE_URL,
      undefined,
      ...EN_LABELS
    );

    expect(html).not.toContain("View event");
  });

  it("renders the caller's translated labels rather than hardcoded English", () => {
    const html = buildEmailHtml(
      "Valorant: ACT V sona erdi",
      "ACT V (Valorant) canlı durumundan bitti durumuna geçti.",
      UNSUBSCRIBE_URL,
      "https://modealert.vercel.app/tr/events/valorant-act-v-abc123",
      "Etkinliği görüntüle",
      "Abonelikten çık",
      "Etkinlik Güncellemesi",
      "Bu e-postayı, watchlist'indeki bir etkinlik güncellendiği için alıyorsun."
    );

    expect(html).toContain("Etkinliği görüntüle");
    expect(html).toContain("Abonelikten çık");
    expect(html).toContain("Etkinlik Güncellemesi");
    expect(html).not.toContain("View event");
    expect(html).not.toContain("Event Update");
  });

  it("escapes HTML in event title/message instead of injecting it raw", () => {
    const html = buildEmailHtml(
      '<img src=x onerror=alert(1)>',
      "Update <script>alert(document.cookie)</script>",
      UNSUBSCRIBE_URL,
      undefined,
      ...EN_LABELS
    );

    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).not.toContain("<script>alert(document.cookie)</script>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain(
      "Update &lt;script&gt;alert(document.cookie)&lt;/script&gt;"
    );
  });
});

describe("buildWelcomeEmailHtml", () => {
  it("links to onboarding", () => {
    const html = buildWelcomeEmailHtml(
      "https://modealert.vercel.app/onboarding"
    );

    expect(html).toContain("https://modealert.vercel.app/onboarding");
    expect(html).toContain("Set up your watchlist");
  });
});
