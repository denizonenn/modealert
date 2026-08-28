import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

import type { Dictionary } from "@/lib/i18n/load-dictionary";
import type { Locale } from "@/lib/i18n/config";

export interface NotificationRecipient {
  id: string;

  email: string;

  discordWebhookUrl?: string | null;

  // The recipient's own language, resolved from User.locale (falling
  // back to the default when they've never chosen one). There's no
  // request/cookie to read here — a notification is sent from a cron
  // job, with no browser attached.
  locale: Locale;
}

export interface NotificationProvider {
  readonly id: string;

  readonly name: string;

  readonly enabled: boolean;

  send(
    recipient: NotificationRecipient,
    event: ProviderEvent,
    previous: EventWithGame | null,
    // Passed in rather than loaded per provider: the trigger service
    // already resolved it once for this recipient, and every provider
    // sending to the same person must say the same thing.
    dict: Dictionary
  ): Promise<void>;
}
