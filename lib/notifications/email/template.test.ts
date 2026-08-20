import { describe, expect, it } from "vitest";

import { buildEmailHtml, buildWelcomeEmailHtml } from "./template";

describe("buildEmailHtml", () => {
  it("embeds title, message, and unsubscribe URL", () => {
    const html = buildEmailHtml(
      "Arcane Anniversary is now LIVE",
      "Arcane Anniversary just appeared with status LIVE.",
      "https://modealert.vercel.app/api/unsubscribe?userId=1&token=abc"
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
      "https://modealert.vercel.app/api/unsubscribe?userId=1&token=abc",
      "https://modealert.vercel.app/events/valorant-act-v-abc123"
    );

    expect(html).toContain("View event");
    expect(html).toContain(
      "https://modealert.vercel.app/events/valorant-act-v-abc123"
    );
  });

  it("omits the CTA entirely when there is no event URL (brand-new event, no slug yet)", () => {
    const html = buildEmailHtml(
      "Valorant: ACT V has ended",
      "ACT V (Valorant) went from live to ended.",
      "https://modealert.vercel.app/api/unsubscribe?userId=1&token=abc"
    );

    expect(html).not.toContain("View event");
  });

  it("escapes HTML in event title/message instead of injecting it raw", () => {
    const html = buildEmailHtml(
      '<img src=x onerror=alert(1)>',
      "Update <script>alert(document.cookie)</script>",
      "https://modealert.vercel.app/api/unsubscribe?userId=1&token=abc"
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
