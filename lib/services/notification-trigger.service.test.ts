import { describe, expect, it, vi } from "vitest";

import type { ProviderEvent } from "@/lib/providers/core/provider";

// Two users watching the same event, with different stored locales —
// the notification copy is built per recipient inside the trigger
// loop, not once per event, so this is the thing worth pinning down:
// a regression here would silently send everyone one language.
const sent: Array<{ email: string; title: string; message: string }> = [];

vi.mock("@/lib/repositories/watchlist.repository", () => ({
  getRecipientsForEvent: async () => [
    {
      id: "u-tr",
      email: "tr@example.com",
      discordWebhookUrl: null,
      emailOptOut: false,
      locale: "tr",
    },
    // null locale = never chose one; must fall back to the default,
    // not crash or inherit the other user's language.
    {
      id: "u-en",
      email: "en@example.com",
      discordWebhookUrl: null,
      emailOptOut: false,
      locale: null,
    },
  ],
}));

vi.mock("@/lib/notifications/core/registry", () => ({
  getNotificationProviders: () => [
    {
      id: "email",
      name: "Email",
      enabled: true,
      async send(
        recipient: { email: string },
        event: ProviderEvent,
        previous: null,
        dict: Parameters<
          typeof import("@/lib/notifications/core/message-builder").buildNotificationContent
        >[2]
      ) {
        const { buildNotificationContent } = await import(
          "@/lib/notifications/core/message-builder"
        );

        sent.push({
          email: recipient.email,
          ...buildNotificationContent(event, previous, dict),
        });
      },
    },
  ],
}));

vi.mock("@/lib/repositories/notification.repository", () => ({
  createNotification: async () => {},
}));

vi.mock("@/lib/repositories/notification-failure.repository", () => ({
  createNotificationFailure: async () => {},
}));

const { notificationTriggerService } = await import(
  "@/lib/services/notification-trigger.service"
);

function event(): ProviderEvent {
  return {
    id: "e1",
    gameId: "lol",
    title: "Arcane Anniversary",
    status: "LIVE",
    category: "PLAYABLE",
    isLimitedTime: true,
    trackedUsers: 0,
    checkedAt: new Date(),
  };
}

describe("notificationTriggerService locale routing", () => {
  it("writes each recipient's notification in their own language", async () => {
    await notificationTriggerService.trigger(event(), null);

    const tr = sent.find((s) => s.email === "tr@example.com")!;
    const en = sent.find((s) => s.email === "en@example.com")!;

    expect(tr.title).toContain("şu an canlı");
    expect(tr.message).toContain("artık takip ediliyor");

    expect(en.title).toContain("is live now");
    expect(en.message).toContain("is now being tracked");

    // The event and game names are real proper nouns — identical in
    // both, only the surrounding copy differs.
    expect(tr.title).toContain("Arcane Anniversary");
    expect(en.title).toContain("Arcane Anniversary");
  });
});
