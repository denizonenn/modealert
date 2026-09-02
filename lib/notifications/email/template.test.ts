import { describe, expect, it } from "vitest";

import {
  buildEmailHtml,
  buildMagicLinkHtml,
  buildWelcomeEmailHtml,
} from "./template";

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

const WELCOME_LABELS = {
  eyebrow: "Welcome",
  title: "You're in.",
  intro: "ModeAlert watches limited-time modes and events across 15 games.",
  cta: "Set up your watchlist",
  footer: "You're getting this email because you just created a ModeAlert account.",
};

describe("buildWelcomeEmailHtml", () => {
  it("links to onboarding", () => {
    const html = buildWelcomeEmailHtml(
      "https://modealert.vercel.app/en/onboarding",
      WELCOME_LABELS
    );

    expect(html).toContain("https://modealert.vercel.app/en/onboarding");
    expect(html).toContain("Set up your watchlist");
  });

  it("renders the caller's translated labels rather than hardcoded English", () => {
    const html = buildWelcomeEmailHtml(
      "https://modealert.vercel.app/tr/onboarding",
      {
        eyebrow: "Hoş Geldin",
        title: "Hazırsın.",
        intro: "ModeAlert 15 oyunda süreli modları izler.",
        cta: "Watchlist'ini kur",
        footer: "Bu e-postayı yeni bir hesap oluşturduğun için alıyorsun.",
      }
    );

    expect(html).toContain("Hoş Geldin");
    expect(html).toContain("Hazırsın.");
    expect(html).toContain("Watchlist&#39;ini kur");
    expect(html).not.toContain("You're in.");
  });
});

const MAGIC_LINK_LABELS = {
  eyebrow: "Sign In",
  title: "Your sign-in link",
  intro:
    "Click below to sign in to ModeAlert. This link expires in 24 hours and can only be used once.",
  cta: "Sign in",
  footer: "If you didn't request this, you can safely ignore this email.",
};

describe("buildMagicLinkHtml", () => {
  it("links the sign-in URL", () => {
    const html = buildMagicLinkHtml(
      "https://modealert.vercel.app/api/auth/callback/resend?token=abc",
      MAGIC_LINK_LABELS
    );

    expect(html).toContain(
      "https://modealert.vercel.app/api/auth/callback/resend?token=abc"
    );
    expect(html).toContain("Your sign-in link");
  });

  it("renders the caller's translated labels rather than hardcoded English", () => {
    const html = buildMagicLinkHtml(
      "https://modealert.vercel.app/api/auth/callback/resend?token=abc",
      {
        eyebrow: "Giriş",
        title: "Giriş linkin",
        intro: "ModeAlert'e giriş yapmak için aşağıya tıkla.",
        cta: "Giriş yap",
        footer: "Bunu sen istemediysen görmezden gelebilirsin.",
      }
    );

    expect(html).toContain("Giriş linkin");
    expect(html).toContain("Giriş yap");
    expect(html).not.toContain("Sign in to ModeAlert");
  });
});
